import Head from "next/head";
import Link from "next/link";
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from "next/router";
import React, { useEffect, useContext } from "react";
import SpecialistCard from "../components/SpecialistCard";
import { BeatLoader } from "react-spinners";
import { MyContext } from "../../utils/ContextApi";
import instance from "../api/api_instance";


function specialistsPage() {
  const [services, setServices] = React.useState([]);
  const [tableData, setTableData] = React.useState([]);
  
  const [loading, setLoading] = React.useState(false);
  const [value, setValue] = React.useState("");
  const allDoctors = services?.flatMap(service => service.doctors) || [];
  const [searchTerm, setSearchTerm] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(12);
  const { langu } = useContext(MyContext);
  const filteredDoctors = allDoctors.filter(doctor => {
    // Department filter (dropdown)
    const matchesDepartment = value ? doctor.department === value : true;

    // Search filter (text field) - searches in name, name_bn, department, and department_bn
    const matchesSearch = searchTerm
      ? (
        // Search in English name
        doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // Search in Bengali name
        doctor.name_bn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // Search in English department
        doctor.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // Search in Bengali department
        doctor.department_bn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        // Search in designation
        doctor.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.designation_bn?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      : true;

    return matchesDepartment && matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const indexOfLastDoctor = currentPage * itemsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - itemsPerPage;
  const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [value, searchTerm]);
  const handleChange = (event) => {
    setValue(event.target.value);
  };
  const router = useRouter();
  const fetchServices = async () => {
    try {
      setLoading(true);

      const response = await instance.get("/pages/131");
      const data = response.data;

      // Collect every "table" type component across all page sections
      const tables = (data?.body || []).flatMap(section =>
        (section.data || []).filter(component => component.type === "table")
      );
      setTableData(tables);

      // Build the doctor list from the doctor table, reading columns by
      // header name (not fixed index) so it stays correct if columns are
      // reordered in the CMS.
      const doctorTable = tables.find(
        t => t._mave?.headers?.includes("Name") && t._mave?.headers?.includes("Department")
      );
      const headers = doctorTable?._mave?.headers || [];
      const rows = doctorTable?._mave?.rows || [];
      const col = (label) => headers.indexOf(label);

      const { createSlug, createUniqueId } = await import("../../utils/pageDataService");

      const departmentNames = [...new Set(
        rows.map(row => row[col("Department")]).filter(Boolean)
      )];

      const transformedData = departmentNames.map(deptName => {
        const deptRows = rows.filter(row => row[col("Department")] === deptName);
        const deptBn = deptRows[0]?.[col("Department_BN")] || deptName;

        return {
          department: deptName,
          department_bn: deptBn,
          doctors: deptRows.map((row, index) => {
            const name = row[col("Name")];
            const qualifications = row[col("Qualifications")];
            const qualifications_bn = row[col("Qualifications_BN")];
            const designation = row[col("Designation")];
            const designation_bn = row[col("Designation_BN")];
            const schedule = row[col("Schedule")];
            const schedule_bn = row[col("Schedule_BN")];

            return {
              name,
              name_bn: row[col("Name_BN")] || name,
              slug: createSlug(name || `doctor-${index}`),
              id: createUniqueId(name || `doctor-${index}`, index),
              department: deptName,
              department_bn: deptBn,
              designation,
              designation_bn: designation_bn || designation,
              qualifications: qualifications ? [qualifications] : [],
              qualifications_bn: qualifications_bn ? [qualifications_bn] : (qualifications ? [qualifications] : []),
              schedule: schedule ? [{ day: 'Available', time: schedule }] : [],
              schedule_bn: schedule_bn ? [{ day: 'Available', time: schedule_bn }] : (schedule ? [{ day: 'Available', time: schedule }] : []),
              hospital: designation,
              hospital_bn: designation_bn || designation,
              image: row[col("photo_link")]
            };
          })
        };
      });

      setServices(transformedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching services:", error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) {
    return (
      <>
        <Head><title>SAJIDA Hospital Ltd</title></Head>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
          <BeatLoader color="#191919" size={30} />
        </Box>
      </>
    );
  }



  return (
    <>
      <Head><title>SAJIDA Hospital Ltd</title></Head>
      <Box sx={{ width: "90%", maxWidth: "1720px", margin: "0 auto", my: 2 }}>
        <Stack justifyContent={"center"} alignItems={"center"}>
          <Typography sx={{ fontSize: { md: 60, xs: 40 }, fontWeight: 500 }}>
            {langu === "en" ? (
              <>Specialists <span style={{ color: "#12A551" }}></span></>
            ) : (
              <>বিশেষজ্ঞবৃন্দ<span style={{ color: "#12A551" }}></span></>
            )}
          </Typography>
          <Stack direction={"row"} spacing={1}  >
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
              {langu === "en" ? "HOME" : "হোম"}
            </Typography>
            <img src={"/assets/about/rightArrow.svg"} width={14} />
            <Typography
              sx={{
                fontSize: 16,
                color: "#AAAAAA",
                textTransform: "uppercase",
              }}
            >
              {langu === "en" ? router?.pathname ? router?.pathname.split("/") : "Not Found" : "বিশেষজ্ঞদের"}
            </Typography>
          </Stack>
        </Stack>

        {/* <img
          src={"/assets/specialist/ban.jpeg"}
          width={"100%"}
          style={{ marginTop: "23px", height: 469, borderRadius: 16, objectFit: "cover" }}
        /> */}
       {/*
        <Box
          component="img"
          src={`/assets/specialist/specialist-cover.jpeg`}
          sx={{
            width: "100%",
            mt: 3,
            borderRadius: "16px",
            height: {
              xs: "190px", // mobile
              sm: "469px", // tablet and desktop
            },
            objectFit: {
              xs: "cover",
              sm: "cover",
            },
            display: "block",
          }}
        />
       */}

        <Typography
          textAlign={"center"}
          sx={{ fontSize: 36, fontWeight: 700, color: "#2A6498", my: 2 }}
        >
          {langu === "en" ? "Trusted Experts by Your Side" : "আমাদের ডাক্তার দল"}
        </Typography>

        <Stack
          direction={{ md: "row", xs: "column" }}
          spacing={1}
          maxWidth={800}
          alignItems={"center"}
        >
          <Select
            fullWidth
            displayEmpty
            size="small"
            variant="outlined"
            value={value}
            onChange={handleChange}
            renderValue={(selected) => {
              if (!selected) {
                return langu === "en" ? "Select Department" : "বিভাগ নির্বাচন করুন";
              }
              // Show Bengali name if available and language is Bengali
              const selectedService = services.find(s => s.department === selected);
              return langu === "bn" ? (selectedService?.department_bn || selected) : selected;
            }}
            sx={{
              cursor: 'pointer',
              '& .MuiSelect-select': {
                cursor: 'pointer',
              },
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 300,
                },
              },
            }}
          >
            <MenuItem value="">
              {langu === "en" ? "All Departments" : "সকল বিভাগ"}
            </MenuItem>
            {services?.map((service, index) => (
              <MenuItem key={index} value={service?.department}>
                {langu === 'bn' ? (service?.department_bn || service?.department) : service?.department}
              </MenuItem>
            ))}
          </Select>

          <TextField
            fullWidth
            size="small"
            placeholder={langu === "en" ? "Search by name, department or designation" : "নাম, বিভাগ বা পদবি দিয়ে খুঁজুন"}
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: "#2A6498",
              color: "white",
              px: 8,
              py: 1.5,
              "&:hover": {
                bgcolor: "#2A6498",
              },
              maxwidth: 106,
              borderRadius: 50,
              textTransform: "capitalize",
            }}
          >
            Submit
          </Button> */}
        </Stack>

        <Grid container spacing={2} my={6}>
          {currentDoctors.length > 0 ? currentDoctors?.map((item, index) => (
            <Grid size={{ md: 4, xl: 3, xs: 12 }} key={index}>
              <SpecialistCard
                title={langu === 'bn' ? (item?.name_bn || item?.name) : item?.name}
                cardImg={item?.image || "/assets/images.png"}
                des={langu === 'bn' ? (item?.designation_bn || item?.designation) : item?.designation}
                // dig={langu === 'bn' ? (item?.qualifications_bn || item?.qualifications) : item?.qualifications}
                btn={langu === "en" ? "View Profile" : "প্রোফাইল দেখুন"}
                slug={item?.slug || `doctor-${index}`}
                path={item.path}
                department={langu === 'bn' ? (item?.department_bn || item?.department) : item?.department}
                doctorId={item?.id}
              />
            </Grid>
          )) : <Typography sx={{ fontSize: 18, mt: 2 }}>{langu === "en" ? "No doctors found." : "কোনো ডাক্তার পাওয়া যায়নি।"}</Typography>}
        </Grid>

        {/* Pagination */}
        {filteredDoctors.length > itemsPerPage && (
          <Stack spacing={2} alignItems="center" sx={{ my: 4 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: '1rem',
                },
                '& .Mui-selected': {
                  bgcolor: '#2A6498 !important',
                  color: 'white',
                },
              }}
            />
          </Stack>
        )}
      </Box>
    </>
  );
}

export default specialistsPage;
