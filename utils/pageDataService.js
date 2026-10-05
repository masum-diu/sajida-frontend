// Utility service to extract and process data from page API response

// Helper function to create consistent slugs
export const createSlug = (name) => {
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

// Helper function to create unique IDs
export const createUniqueId = (name, index) => {
  const slug = createSlug(name);
  return `doctor-${index + 1}-${slug}`;
};

// Helper function to get default Bengali translations for departments
const getDefaultBengaliTranslation = (departmentName) => {
  const translations = {
    "Ultrasonography": "আল্ট্রাসনোগ্রাফি",
    "Food and nutrition specialist": "খাদ্য ও পুষ্টি বিশেষজ্ঞ",
    "Dermatology & Venereology": "চর্ম ও যৌনরোগ",
    "Nephrology": "নেফ্রোলজি (কিডনি)",
    "Cardiology": "কার্ডিওলজি (হৃদরোগ)",
    "ENT": "ইএনটি (কান-নাক-গলা)",
    "Pediatrics & NICU": "শিশুরোগ ও এনআইসিইউ",
    "Orthopaedic": "অর্থোপেডিক্স",
    "Gynae & OBS": "গাইনি ও প্রসূতি",
    "Anesthesia": "অ্যানেস্থেসিয়া",
    "General Surgery": "সাধারণ সার্জারি",
    "Medicine": "মেডিসিন"
  };

  return translations[departmentName] || departmentName;
};

export const extractBodyPartsAndDepartments = (pageData) => {
  if (!pageData || !pageData.body) {
    return {
      departments: [],
      doctors: [],
      bodyParts: []
    };
  }

  let departments = [];
  let doctors = [];
  let bodyParts = [];

  // Find the section with doctor data (Section 8)
  const doctorSection = pageData.body.find(section =>
    section.title === "Section 8" ||
    section.data?.some(component => component.type === "table")
  );

  if (doctorSection) {
    // Extract departments from the first table
    const departmentTable = doctorSection.data.find(component =>
      component.type === "table" &&
      component._mave?.headers?.includes("department_name")
    );

    if (departmentTable && departmentTable._mave?.rows) {
      departments = departmentTable._mave.rows.map((row) => {
        const deptName = row[0];
        const iconUrl = row[1] || null;

        return {
          name: deptName,
          name_bn: row[2], // Bengali name from department_name_BN column
          icon: iconUrl
        };
      });
    }

    // Extract doctors from the second table. Columns are read by header
    // name (not fixed index) since the live CMS table is
    // [Department, Name, Qualifications, Designation, Schedule, photo_link,
    //  Department_BN, Name_BN, Qualifications_BN, Designation_BN, Schedule_BN]
    // - there is no Body Part column, and the order doesn't match a
    // fixed-index reading.
    const doctorTable = doctorSection.data.find(component =>
      component.type === "table" &&
      component._mave?.headers?.includes("Name")
    );

    if (doctorTable && doctorTable._mave?.rows) {
      const headers = doctorTable._mave.headers || [];
      const col = (label) => headers.indexOf(label);
      const bodyPartCol = col("Body Part") !== -1 ? col("Body Part") : col("BodyPart");
      const bodyPartBnCol = col("Body Part_BN") !== -1 ? col("Body Part_BN") : col("BodyPart_BN");

      doctors = doctorTable._mave.rows.map((row, index) => {
        const name = row[col("Name")];
        const slug = createSlug(name || `doctor-${index}`);
        const uniqueId = createUniqueId(name || `doctor-${index}`, index);
        const department = row[col("Department")];
        const department_bn = row[col("Department_BN")] || department;
        const qualifications = row[col("Qualifications")];
        const designation = row[col("Designation")];
        const schedule = row[col("Schedule")];
        const imageUrl = row[col("photo_link")] || null;

        return {
          id: uniqueId, // Unique ID
          originalId: index + 1,
          name: name,
          name_bn: row[col("Name_BN")] || name, // Bengali name
          slug: slug, // URL-friendly slug
          department, // Department
          department_bn, // Bengali department
          qualifications, // Qualifications
          qualifications_bn: row[col("Qualifications_BN")] || qualifications, // Bengali qualifications
          designation, // Designation
          designation_bn: row[col("Designation_BN")] || designation, // Bengali designation
          schedule, // Schedule
          schedule_bn: row[col("Schedule_BN")] || schedule, // Bengali schedule
          image: imageUrl, // photo_link
          bodyParts: bodyPartCol !== -1 && row[bodyPartCol] ? row[bodyPartCol].split(', ').map(part => part.trim()) : [], // Body Part
          bodyParts_bn: bodyPartBnCol !== -1 && row[bodyPartBnCol] ? row[bodyPartBnCol].split(', ').map(part => part.trim()) : [] // Bengali Body Part
        };
      });

      // Extract unique body parts
      const allBodyParts = doctors.flatMap(doctor => doctor.bodyParts);
      bodyParts = [...new Set(allBodyParts)].filter(Boolean);

      // Extract additional departments from doctor table that might not be in department table
      const doctorDepartments = doctors.map(doctor => ({
        name: doctor.department,
        name_bn: doctor.department_bn || getDefaultBengaliTranslation(doctor.department),
        icon: null // No icon for doctor-extracted departments
      }));

      // Merge departments from both sources, avoiding duplicates
      // (both against the department table AND among the doctor rows themselves,
      // since multiple doctors can share the same department)
      const existingDeptNames = departments.map(d => d.name);
      const seenAdditionalDeptNames = new Set();
      const additionalDepartments = doctorDepartments.filter(dept => {
        if (existingDeptNames.includes(dept.name) || seenAdditionalDeptNames.has(dept.name)) {
          return false;
        }
        seenAdditionalDeptNames.add(dept.name);
        return true;
      });

      // Combine all departments
      departments = [...departments, ...additionalDepartments];
    }
  }

  return {
    departments,
    doctors,
    bodyParts
  };
};

export const getDoctorsByDepartment = (doctors, department) => {
  if (!doctors || !department) return [];

  return doctors.filter(doctor => doctor.department === department);
};

export const getDoctorsByBodyPart = (doctors, bodyPart) => {
  if (!doctors || !bodyPart) return [];

  return doctors.filter(doctor =>
    doctor.bodyParts.some(part =>
      part.toLowerCase().includes(bodyPart.toLowerCase()) ||
      bodyPart.toLowerCase().includes(part.toLowerCase())
    )
  );
};

export const getDoctorsByBodyPartAndDepartment = (doctors, bodyPart, department) => {
  if (!doctors) return [];

  let filteredDoctors = doctors;

  if (bodyPart) {
    filteredDoctors = getDoctorsByBodyPart(filteredDoctors, bodyPart);
  }

  if (department) {
    filteredDoctors = getDoctorsByDepartment(filteredDoctors, department);
  }

  return filteredDoctors;
};
