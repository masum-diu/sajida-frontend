import React, { useEffect } from "react";
import { Box } from "@mui/material";
import { useRouter } from "next/router";
import FormSubmit from "../components/FormSubmit";
import instance from "../api/api_instance";

function appointment() {
  const router = useRouter();
  const { id } = router.query;
  const [services, setServices] = React.useState([]);
  const [doctor, setDoctor] = React.useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await instance.get("/pages/131");
        const data = response.data;

        const { extractBodyPartsAndDepartments } = await import("../../utils/pageDataService");
        const { doctors, departments } = extractBodyPartsAndDepartments(data);

        const transformedData = departments.map((dept) => {
          const deptName = dept.name;
          const deptBn = dept.name_bn || deptName;
          const deptDoctors = doctors
            .filter((d) => d.department === deptName)
            .map((d) => ({
              name: d.name,
              name_bn: d.name_bn || d.name,
              slug: d.slug,
              id: d.id,
              department: deptName,
              department_bn: deptBn,
              designation: d.designation,
              designation_bn: d.designation_bn || d.designation,
              qualifications: d.qualifications ? [d.qualifications] : [],
              qualifications_bn: d.qualifications_bn
                ? [d.qualifications_bn]
                : d.qualifications
                  ? [d.qualifications]
                  : [],
              schedule: d.schedule ? [{ day: "Available", time: d.schedule }] : [],
              schedule_bn: d.schedule_bn
                ? [{ day: "Available", time: d.schedule_bn }]
                : d.schedule
                  ? [{ day: "Available", time: d.schedule }]
                  : [],
              hospital: d.designation,
              hospital_bn: d.designation_bn || d.designation,
              image: d.image,
            }));

          return {
            department: deptName,
            department_bn: deptBn,
            doctors: deptDoctors,
          };
        });

        setServices(transformedData);
      } catch {
        const response = await fetch("/doctors.json");
        const data = await response.json();
        setServices(data);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    if (!router.isReady || !id || services.length === 0) return;

    const allDoctors = services.flatMap((service) => service.doctors);
    const matchedDoctor = allDoctors.find(
      (d) => d.slug === id || String(d.id) === String(id)
    );

    setDoctor(matchedDoctor || null);
  }, [router.isReady, id, services]);

  return (
    <Box
      sx={{
        width: "90%",
        maxWidth: "1720px",
        margin: "0 auto",
        my: 3,
      }}
    >
      <FormSubmit preselectedDoctor={doctor} />
    </Box>
  );
}

export default appointment;
