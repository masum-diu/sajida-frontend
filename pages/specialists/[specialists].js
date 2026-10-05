import {
  Box,
  Button,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState, useContext } from "react";
import { BeatLoader } from "react-spinners";
import FormSubmit from "../components/FormSubmit";
import { createSlug, createUniqueId } from "../../utils/pageDataService";
import { MyContext } from "../../utils/ContextApi";
import instance from "../api/api_instance";

function specialists() {
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState(null);
  const [allDoctors, setAllDoctors] = useState([]);
  const { langu } = useContext(MyContext);

  // Data fetch - try dynamic API first, fallback to JSON
  const fetchServices = async () => {
    try {
      setLoading(true);

      // Try to fetch from dynamic API first
      try {
        const response = await instance.get("/pages/131");
        const data = response.data;
        setPageData(data);

        // Collect every "table" type component across all page sections
        const tables = (data?.body || []).flatMap(section =>
          (section.data || []).filter(component => component.type === "table")
        );

        // Build the doctor list from the doctor table, reading columns by
        // header name (not fixed index) so it stays correct if columns are
        // reordered in the CMS.
        const doctorTable = tables.find(
          t => t._mave?.headers?.includes("Name") && t._mave?.headers?.includes("Department")
        );
        const headers = doctorTable?._mave?.headers || [];
        const rows = doctorTable?._mave?.rows || [];
        const col = (label) => headers.indexOf(label);

        const doctors = rows.map((row, index) => {
          const name = row[col("Name")];
          const qualifications = row[col("Qualifications")];
          const qualifications_bn = row[col("Qualifications_BN")];
          const designation = row[col("Designation")];
          const designation_bn = row[col("Designation_BN")];
          const schedule = row[col("Schedule")];
          const schedule_bn = row[col("Schedule_BN")];
          const department = row[col("Department")];
          const department_bn = row[col("Department_BN")] || department;

          return {
            id: createUniqueId(name || `doctor-${index}`, index),
            name,
            name_bn: row[col("Name_BN")] || name,
            slug: createSlug(name || `doctor-${index}`),
            department,
            department_bn,
            designation,
            designation_bn: designation_bn || designation,
            qualifications: qualifications ? [qualifications] : [],
            qualifications_bn: qualifications_bn ? [qualifications_bn] : (qualifications ? [qualifications] : []),
            schedule: schedule ? [{ day: 'Available', time: schedule }] : [],
            schedule_bn: schedule_bn ? [{ day: 'উপলব্ধ', time: schedule_bn }] : (schedule ? [{ day: 'উপলব্ধ', time: schedule }] : []),
            hospital: designation,
            hospital_bn: designation_bn || designation,
            image: row[col("photo_link")]
          };
        });

        setAllDoctors(doctors);

        // Transform doctors data to match the expected format
        const transformedData = doctors.reduce((acc, doctor) => {
          const deptName = doctor.department;
          if (!acc.find(dept => dept.department === deptName)) {
            acc.push({
              department: deptName,
              doctors: doctors.filter(d => d.department === deptName)
            });
          }
          return acc;
        }, []);

        setServices(transformedData);
      } catch (apiError) {
        // Fallback to JSON file
        const response = await fetch("/doctors.json");
        const data = await response.json();
        setServices(data);
        setAllDoctors((data || []).flatMap((dept) => dept.doctors || []));
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching services:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Memoized doctor - match by slug (stable across pages), using department
  // (English or Bangla, since the card passes whichever language is active)
  // to disambiguate doctors that share a name.
  const doctorsfind = useMemo(() => {
    const { specialists: slug, department } = router?.query || {};
    const sameSlug = allDoctors.filter((doc) => doc.slug === slug);
    const foundDoctor =
      sameSlug.find(
        (doc) => doc.department === department || doc.department_bn === department
      ) || sameSlug[0];

    if (foundDoctor) {
      return {
        name: langu === 'bn' ? (foundDoctor.name_bn || foundDoctor.name) : foundDoctor.name,
        slug: foundDoctor.slug,
        designation: langu === 'bn' ? (foundDoctor.designation_bn || foundDoctor.designation) : foundDoctor.designation,
        qualifications: langu === 'bn' ?
          (foundDoctor.qualifications_bn || foundDoctor.qualifications) :
          foundDoctor.qualifications,
        schedule: langu === 'bn' ?
          (foundDoctor.schedule_bn || foundDoctor.schedule) :
          foundDoctor.schedule,
        hospital: langu === 'bn' ? (foundDoctor.hospital_bn || foundDoctor.hospital) : foundDoctor.hospital,
        image: foundDoctor.image
      };
    }

    return foundDoctor;
  }, [router?.query?.specialists, router?.query?.department, allDoctors, langu]);


  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <BeatLoader color="#191919" size={30} />
      </Box>
    );
  }
  return (
    <>
      <Box sx={{ width: "90%", maxWidth: "1720px", margin: "0 auto", my: 2 }}>
        <Stack justifyContent={"center"} alignItems={"center"}>
          <Typography sx={{ fontSize: { md: 60, xs: 40 }, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: (langu === 'bn' ? 'আমাদের নিবেদিত' : 'Our Dedicated') + ' <span style="color:#12A551">' + (langu === 'bn' ? 'বিশেষজ্ঞরা' : 'Specialists') + '</span>' }} />
          <Stack direction={"row"} spacing={1}>
            <Typography
              component={Link}
              href="/"
              sx={{
                fontSize: 16,
                color: "#AAAAAA",
                textDecoration: "none",
                "&:hover": { color: "#12A551" },
              }}
            >
              {langu === 'bn' ? 'হোম' : 'HOME'}
            </Typography>
            <img src={"/assets/about/rightArrow.svg"} width={14} />
            <Typography
              component={Link}
              href="/specialists"
              sx={{
                fontSize: 16,
                color: "#AAAAAA",
                textTransform: "uppercase",
                textDecoration: "none",
                "&:hover": { color: "#12A551" },
              }}
            >
              {langu === 'bn' ? 'বিশেষজ্ঞরা' : 'specialists'}
            </Typography>
            <img src={"/assets/about/rightArrow.svg"} width={14} />
            <Typography
              sx={{
                fontSize: 16,
                color: "#AAAAAA",
                textTransform: "uppercase",
              }}
            >
              {router?.query.specialists
                ? router.query.specialists.split("-").join(" ")
                : (langu === 'bn' ? 'খুঁজে পাওয়া যায়নি' : "Not Found")}
            </Typography>
          </Stack>
        </Stack>

        <img
          src={"/assets/specialist/banner2.svg"}
          width={"100%"}
          style={{ marginTop: "23px" }}
        />

        <Typography
          my={4}
          sx={{ color: "#2A6498", fontSize: 36, fontWeight: 700 }}
          dangerouslySetInnerHTML={{ __html: (langu === 'bn' ? 'ডাক্তারের বিবরণ' : 'DOCTORS DETAILS') || "" }}
        />

        <Grid container spacing={10}>
          {/* first grid */}
          <Grid size={{ md: 4, xs: 12 }}>
            <Paper
              elevation={0}
              sx={{
                maxWidth: 544,
                borderRadius: 3,
                overflow: "hidden",
                border: "3px solid #2A6498",
                textAlign: "center",
                mx: "auto",
              }}
            >
              <Stack spacing={0}>
                {/* Doctor Image */}
                <Box
                  component="img"
                  src={doctorsfind?.image || "/assets/images.png"}
                  alt={doctorsfind?.name || "Doctor"}
                  sx={{
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    backgroundColor: "#fff",
                  }}
                  onError={(e) => {
                    e.target.src = "/assets/images.png";
                  }}
                />

                {/* Blue Background Section */}
                <Box sx={{ backgroundColor: "#2A6498", py: 2, px: 2 }}>
                  <Typography
                    sx={{ fontSize: 16, fontWeight: 600, color: "#ffffff" }}
                    dangerouslySetInnerHTML={{ __html: doctorsfind?.name || "" }}
                  />

                  <hr
                    style={{
                      border: "none",
                      height: "1px",
                      backgroundColor: "#4E7EAA",
                      width: 319,
                      margin: "12px auto",
                    }}
                  />

                  {/* Decorative Line */}
                  <Box
                    sx={{
                      height: 1,
                      backgroundColor: "#1C7DC1",
                      width: "50%",
                      mx: "auto",
                      my: 1.5,
                    }}
                  />

                  {/* Fake Button */}
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#12A551",
                      textTransform: "uppercase",

                      px: 2,
                      py: 0.5,
                    }}
                    dangerouslySetInnerHTML={{ __html: (langu === 'bn' ? 'অ্যাপয়েন্টমেন্ট করুন' : 'Make an Appointment') || "" }}
                  />
                </Box>
              </Stack>
            </Paper>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              alignItems="center"
              mt={1}
            >
              {/* Social Share */}
              <Box sx={{ py: 2 }}>
                <Typography
                  sx={{ fontSize: 16, fontWeight: 600, color: "#000" }}
                >
                  {langu === 'bn' ? 'শেয়ার করুন:' : 'Share on:'}
                </Typography>
              </Box>
              <img
                src="/assets/specialist/Symbol1.svg"
                width={12}
                alt="Facebook"
              />
              <img
                src="/assets/specialist/Symbol2.svg"
                width={20}
                alt="Twitter"
              />
              <img
                src="/assets/specialist/Symbol3.svg"
                width={20}
                alt="LinkedIn"
              />
            </Stack>
          </Grid>
          {/* second grid */}
          <Grid size={{ md: 8, xs: 12 }}>
            <Typography sx={{ fontSize: 28, fontWeight: 700 }} dangerouslySetInnerHTML={{ __html: doctorsfind?.name || "" }} />
            <Typography
              sx={{ color: "#12A551", fontSize: 14, fontWeight: 700 }}
              dangerouslySetInnerHTML={{ __html: doctorsfind?.designation || "" }}
            />
            <hr
              style={{
                border: "none",
                height: "2px",
                backgroundColor: "#F0F0F0",
                // width: 319,
                margin: "12px auto",
              }}
            />
            {/* Qualifications */}
            <Box mt={4}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 1 }}>
                {langu === 'bn' ? 'যোগ্যতা' : 'Qualifications'}
              </Typography>
              <Box component="ul" sx={{ pl: 3, m: 0 }}>
                {doctorsfind?.qualifications?.map((q, idx) => (
                  <Box
                    component="li"
                    key={idx}
                    sx={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: "#222",
                      mb: 0.5,
                    }}
                    dangerouslySetInnerHTML={{
                      __html: (Array.isArray(q) ? q.join(", ") : (q != null ? String(q) : "")) || "",
                    }}
                  />
                ))}
              </Box>
            </Box>


            {/* Schedule */}
            {/* <Box mt={2}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 1 }}>
                {langu === 'bn' ? 'ভিজিটিং সময়সূচী' : 'Visiting Schedule'}
              </Typography>
              {doctorsfind?.schedule?.map ? (
                doctorsfind.schedule.map((sch, idx) => (
                  <Typography key={idx} sx={{ fontSize: 16, color: "#222" }} dangerouslySetInnerHTML={{ __html: `${sch.day === 'Available' && langu === 'bn' ? 'উপলব্ধ' : sch.day} — ${sch.time}` }} />
                ))
              ) : (
                doctorsfind?.schedule && (
                  <Typography sx={{ fontSize: 16, color: "#222" }} dangerouslySetInnerHTML={{ __html: (doctorsfind.schedule === 'Available' && langu === 'bn' ? 'উপলব্ধ' : doctorsfind.schedule) || "" }} />
                )
              )}
            </Box> */}
            {/* {doctorsfind?.hospital && <Box mt={2}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 1 }} dangerouslySetInnerHTML={{ __html: (langu === 'bn' ? 'হাসপাতাল' : 'Hospital') || "" }} />

              <Typography sx={{ fontSize: 16, color: "#222", }} dangerouslySetInnerHTML={{ __html: doctorsfind?.hospital || "" }} />

            </Box>} */}

            {/* <Box mt={2}>
              <Typography
                component="li"
                sx={{ fontSize: 14, color: "#222222" }}
              >
                Ms. Shaila Sabrin obtained her{" "}
                <span style={{ fontWeight: 700 }}>M. Phil </span>(Nutrition &
                Food Science) from Dhaka University.
              </Typography>
              <Typography
                component="li"
                sx={{ fontSize: 14, color: "#222222" }}
              >
                Subsequently she completed
                <span style={{ fontWeight: 700 }}>MS </span> and{" "}
                <span style={{ fontWeight: 700 }}>Sc.</span> in Food & Nutrition
                from the same UniversityHeld on 22 February 2025, the event,
                organised by
              </Typography>

              <Typography
                component="li"
                sx={{ fontSize: 14, color: "#222222" }}
              >
                She has experience of working in various national &
                multi–national organizations and hospitals At the Philanthropy
                Conclave 2025, SAJIDA in different positions i.e. Samorita
                Hospital; BRB Hospital (Gastro Liver Hospital); ICDDRB; At the
                Philanthropy Conclave 2025, SAJIDA Glaxo Smith Kline (gsk);
                Tetra Pak; Nursing Institute Medical College for Women, Uttara
                and sustainable care economy care economy IPDC as Nutrition
                Counselor/Nutritionist.
              </Typography>

              <Typography
                component="li"
                sx={{ fontSize: 14, color: "#222222" }}
              >
                Ms. Shaila attended trainings on Clinical Nutrition & Dietetics
                from BIRDEM General Hospital as Dietetics from BIRDEM General
                Hospital as well as Management & Prevention of Gestational
                Diabetes Mellitius organized by CGDM Project, Mellitius
                organized by CGDM Project, Bangladesh University of Health
                Science, Dhaka.
              </Typography>

              <Typography
                component="li"
                sx={{ fontSize: 14, color: "#222222" }}
              >
                Ms. Shaila attended trainings on Clinical Nutrition & Dietetics
                from BIRDEM General Hospital as Dietetics from BIRDEM General
                Hospital as abroad (Indonesia, Chennai, Indore, Bengaluru).
              </Typography>
              <Typography
                component="li"
                sx={{ fontSize: 14, color: "#222222" }}
              >
                Ms. Shaila attended trainings on Clinical Nutrition & Dietetics
                from BIRDEM General Hospital as Dietetics from BIRDEM General
                Hospital as and serving patients regularly.
              </Typography>
            </Box> */}
          </Grid>
        </Grid>
        <FormSubmit />
      </Box>
    </>
  );
}

export default specialists;
