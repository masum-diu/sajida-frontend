// lib/doctors-remote.js

const DEFAULT_PAGE_ID = 131;

// Simple in-memory cache to avoid hammering upstream (TTL 2 minutes)
const _cache = new Map();
const TTL_MS = 2 * 60 * 1000;

function cacheGet(key) {
    const item = _cache.get(key);
    if (!item) return null;
    if (Date.now() - item.t > TTL_MS) {
        _cache.delete(key);
        return null;
    }
    return item.v;
}
function cacheSet(key, value) {
    _cache.set(key, { t: Date.now(), v: value });
}

async function fetchPageJson(pageId) {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://engine.sajidahospital.org/api";
    const url = `${baseUrl}/pages/${pageId}`;
    const cached = cacheGet(url);
    if (cached) return cached;

    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
        throw new Error(`Upstream fetch failed (${res.status}): ${url}`);
    }
    const json = await res.json();
    cacheSet(url, json);
    return json;
}

// Find the first or selected (tableIndex) table component in the page body
function findTableComponent(pageJson, tableIndex) {
    if (!pageJson || !Array.isArray(pageJson.body)) return null;
    const tables = [];

    for (const section of pageJson.body) {
        const data = section?.data;
        if (!Array.isArray(data)) continue;
        for (const comp of data) {
            if (comp?.type === "table" && comp?._mave && Array.isArray(comp._mave.headers) && Array.isArray(comp._mave.rows)) {
                tables.push(comp);
            }
        }
    }

    if (tables.length === 0) return null;
    const idx = Number.isInteger(tableIndex) && tableIndex >= 0 && tableIndex < tables.length ? tableIndex : 0;
    return tables[idx];
}

function parseBodyParts(cell) {
    if (!cell) return null;
    const parts = String(cell)
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
    return parts.length ? Array.from(new Set(parts)) : null;
}

function rowsToDoctors(headers, rows) {
    // Columns are read by header name (not fixed index) since the live CMS
    // table is [Department, Name, Qualifications, Designation, Schedule,
    // photo_link, Department_BN, Name_BN, Qualifications_BN, Designation_BN,
    // Schedule_BN] - there is no Body Part column.
    const cols = Array.isArray(headers) ? headers : [];
    const col = (label) => cols.indexOf(label);
    const bodyPartCol = col("Body Part") !== -1 ? col("Body Part") : col("BodyPart");

    const doctors = rows.map((row) => {
        const r = Array.isArray(row) ? row : [];
        const bodyPart = bodyPartCol !== -1 ? (r[bodyPartCol] ?? null) : null;
        const departmentName = r[col("Department")] ?? null;

        return {
            bodyParts: parseBodyParts(bodyPart),
            department: departmentName,
            name: r[col("Name")] ?? null,
            qualifications: r[col("Qualifications")] ?? null,
            designation: r[col("Designation")] ?? null,
            schedule: r[col("Schedule")] ?? null
        };
    });
    return doctors;
}

async function loadDoctors({ pageId = DEFAULT_PAGE_ID, tableIndex } = {}) {
    const pageJson = await fetchPageJson(pageId);
    const table = findTableComponent(pageJson, Number.isInteger(tableIndex) ? tableIndex : undefined);
    if (!table) return [];
    const headers = table._mave.headers || [];
    const rows = table._mave.rows || [];
    return rowsToDoctors(headers, rows);
}

async function loadDepartments({ pageId = DEFAULT_PAGE_ID, tableIndex } = {}) {
    const pageJson = await fetchPageJson(pageId);
    const table = findTableComponent(pageJson, Number.isInteger(tableIndex) ? tableIndex : undefined);
    if (!table) return [];

    const headers = table._mave.headers || [];
    const rows = table._mave.rows || [];

    // Check if this is a department table (has department_name, icon_link, department_name_BN columns)
    const isDeptTable = headers.includes('department_name') && headers.includes('icon_link');

    if (!isDeptTable) return [];

    const deptNameIndex = headers.indexOf('department_name');
    const iconLinkIndex = headers.indexOf('icon_link');
    const deptNameBNIndex = headers.indexOf('department_name_BN');

    return rows.map(row => ({
        name: row[deptNameIndex] || null,
        icon_link: row[iconLinkIndex] || null,
        name_bn: row[deptNameBNIndex] || null
    })).filter(dept => dept.name); // Filter out empty entries
}

function getAllDepartmentsFromDocs(doctors) {
    const deptMap = new Map();
    for (const d of doctors) {
        // The bodyParts field actually contains department names
        if (d.bodyParts && Array.isArray(d.bodyParts)) {
            d.bodyParts.forEach(dept => {
                if (!deptMap.has(dept)) {
                    deptMap.set(dept, {
                        name: dept,
                        icon_link: null // Will be populated from department data if available
                    });
                }
            });
        }
    }
    return Array.from(deptMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function getAllBodyPartsFromDocs(doctors) {
    const set = new Set();
    for (const d of doctors) (d.bodyParts || []).forEach(bp => set.add(bp));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
}

// ---------- Filtering / Sorting / Pagination helpers ----------
function matchesBodyPart(doc, bodyPart) {
    if (!bodyPart) return true;
    const parts = Array.isArray(bodyPart) ? bodyPart : [bodyPart];
    if (!doc.bodyParts || doc.bodyParts.length === 0) return false;
    const docSet = new Set(doc.bodyParts.map(p => String(p).toLowerCase()));
    return parts.some(p => docSet.has(String(p).toLowerCase()));
}

function matchesDepartment(doc, department) {
    if (!department) return true;
    const deps = Array.isArray(department) ? department : [department];
    if (!doc.department) return false;
    const d = String(doc.department).toLowerCase();
    return deps.some(dep => d === String(dep).toLowerCase());
}

function matchesSearch(doc, q) {
    if (!q) return true;
    const needle = String(q).toLowerCase();
    const hay = [
        doc.name,
        doc.qualifications,
        doc.designation,
        doc.department
    ].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(needle);
}

function sortDoctors(arr, sort, order) {
    const field = sort === "department" ? "department" : "name"; // default name
    const dir = order === "desc" ? "desc" : "asc";
    return arr.sort((a, b) => {
        const av = a[field] ?? "";
        const bv = b[field] ?? "";
        const cmp = String(av).localeCompare(String(bv));
        return dir === "asc" ? cmp : -cmp;
    });
}

function paginate(arr, page, limit) {
    const total = arr.length;
    const pages = Math.max(1, Math.ceil(total / limit));
    const p = Math.max(1, Math.min(page, pages));
    const start = (p - 1) * limit;
    const end = start + limit;
    return { data: arr.slice(start, end), meta: { total, page: p, pages, limit } };
}

module.exports = {
    loadDoctors,
    loadDepartments,
    getAllDepartmentsFromDocs,
    getAllBodyPartsFromDocs,
    matchesBodyPart,
    matchesDepartment,
    matchesSearch,
    sortDoctors,
    paginate
};
