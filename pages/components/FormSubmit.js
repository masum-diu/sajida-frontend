import { Box, Button, Grid, MenuItem, Select, TextField, Typography } from '@mui/material'
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { createSlug, createUniqueId } from '../../utils/pageDataService';
import { MyContext } from '@/utils/ContextApi';
import instance from '../api/api_instance';
import { useRouter } from 'next/router';

const BD_PHONE_REGEX = /^(?:\+?880|0)1[3-9]\d{8}$/;

function FormSubmit({ preselectedDoctor = null }) {
  const [services, setServices] = useState(null)
  const router = useRouter()
  const [doctors, setDoctors] = useState(null)
  const { langu } = useContext(MyContext);
  const isFieldsLocked = Boolean(preselectedDoctor);
  const [formData, setFormData] = useState(
    {
      name: "",
      phone: "",
      email: "",
      department: "",
      service: "",
      doctor: "",
      message: ""
    }
  )
  const [errors, setErrors] = useState({ name: false, phone: false });
  const department = doctors?.find(d => d.department === formData?.department);
  const lockedSelectSx = {
    borderRadius: "24px",
    maxWidth: "556px",
    "&.Mui-disabled .MuiSelect-select": {
      color: "rgba(0, 0, 0, 0.65)",
      WebkitTextFillColor: "rgba(0, 0, 0, 0.65)",
    },
  };
  const selectSx = {
    borderRadius: "24px",
    maxWidth: "556px",
  };

  useEffect(() => {
    if (!preselectedDoctor) return;

    const defaultService =
      langu === "en" ? "Consultation / First Visit" : "পরামর্শ / প্রথম ভিজিট";

    setFormData((prev) => ({
      ...prev,
      department: preselectedDoctor.department || "",
      doctor: preselectedDoctor.name || preselectedDoctor.name_bn || preselectedDoctor.slug || "",
      service: defaultService,
    }));
  }, [preselectedDoctor, langu]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to fetch from dynamic API first
        const response = await instance.get("/pages/131");
        const data = response.data;

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

        const extractedDoctors = rows.map((row, index) => {
          const name = row[col("Name")];
          const qualifications = row[col("Qualifications")];
          const designation = row[col("Designation")];
          const schedule = row[col("Schedule")];

          return {
            id: createUniqueId(name || `doctor-${index}`, index),
            name,
            slug: createSlug(name || `doctor-${index}`),
            department: row[col("Department")],
            designation,
            qualifications: qualifications ? [qualifications] : [],
            schedule: schedule ? [{ day: 'Available', time: schedule }] : [],
            hospital: designation,
            image: row[col("photo_link")]
          };
        });

        // Transform doctors data to match the expected format
        const transformedDoctors = extractedDoctors.reduce((acc, doctor) => {
          const deptName = doctor.department;
          if (!acc.find(dept => dept.department === deptName)) {
            acc.push({
              department: deptName,
              doctors: extractedDoctors.filter(d => d.department === deptName)
            });
          }
          return acc;
        }, []);

        setDoctors(transformedDoctors);
        setServices(transformedDoctors); // Use same data for services
      } catch (error) {
        // Fallback to JSON files
        fetch("/services.json")
          .then(res => res.json())
          .then(data => setServices(data));

        fetch("/doctors.json")
          .then(res => res.json())
          .then(data => setDoctors(data));
      }
    };

    loadData();
  }, []);
  const initialFormData = {
    name: "",
    phone: "",
    email: "",
    doctor: "",
    department: "",
    service: "",
    message: ""
  };
  const validate = () => {
    const nextErrors = {
      name: !formData.name.trim(),
      phone: !BD_PHONE_REGEX.test(formData.phone.trim()),
    };
    setErrors(nextErrors);
    return !nextErrors.name && !nextErrors.phone;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error(
        langu === "en"
          ? "Please fill in all required fields."
          : "সব আবশ্যক ফিল্ড পূরণ করুন।",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );
      return;
    }
    try {
      const payload = {
        form_id: "19",
        form_data: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          doctor: formData.doctor,
          department: formData.department,
          service: formData.service,
          message: formData.message
        },
        status: "pending",
        submitted_at: new Date().toISOString()
      };
      const response = await axios.post("https://engine.sajidahospital.org/api/form-submission?form_id=19", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        }
      });

      toast.success(response?.data?.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setFormData(initialFormData);
      setErrors({ name: false, phone: false });

      router.push('/submission')

    } catch (error) {
      toast.error(error, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      // console.error("Error submitting form:", error);
      if (error.response) {
        toast.error("Submission failed. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });

      } else {
        // alert("Submission failed. Please try again.");
      }
    }
  };
  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 600,
          mb: 4,
          color: "#2A6498",
          textAlign: "center",
        }}
      >
        {langu === "en" ? "Appointment Form" : "অ্যাপয়েন্টমেন্ট ফর্ম"}
      </Typography>

      <Grid container spacing={3}>
        {/* Name - Required */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            {langu === "en" ? "Name" : "নাম"}{" "}
            <span style={{ color: "#EA0004" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (errors.name) setErrors({ ...errors, name: false });
            }}
            size="small"
            placeholder={langu === "en" ? "Enter your name" : "আপনার নাম লিখুন"}
            variant="outlined"
            required
            error={errors.name}
            helperText={errors.name ? (langu === "en" ? "Name is required" : "নাম আবশ্যক") : ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "24px",
              },
              maxWidth: "556px",
            }}
          />
        </Grid>

        {/* Phone */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            {langu === "en" ? "Phone" : "ফোন"}{" "}
            <span style={{ color: "#EA0004" }}>*</span>
          </Typography>
          <TextField
            fullWidth
            value={formData.phone}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value });
              if (errors.phone) setErrors({ ...errors, phone: false });
            }}
            size="small"
            placeholder={
              langu === "en"
                ? "Enter your phone number"
                : "আপনার ফোন নম্বর লিখুন"
            }
            variant="outlined"
            type="tel"
            required
            error={errors.phone}
            helperText={
              errors.phone
                ? formData.phone.trim()
                  ? (langu === "en" ? "Enter a valid Bangladeshi phone number" : "সঠিক বাংলাদেশী ফোন নম্বর দিন")
                  : (langu === "en" ? "Phone is required" : "ফোন আবশ্যক")
                : ""
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "24px",
              },
              maxWidth: "556px",
            }}
          />
        </Grid>

        {/* Email */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            {langu === "en" ? "Email" : "ইমেইল"}
          </Typography>
          <TextField
            fullWidth
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder={
              langu === "en" ? "Enter your email" : "আপনার ইমেইল লিখুন"
            }
            size="small"
            variant="outlined"
            type="email"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "24px",
              },
              maxWidth: "556px",
            }}
          />
        </Grid>

        {/* Department */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            {langu === "en" ? "Department" : "বিভাগ"}
          </Typography>
          <Select
            fullWidth
            displayEmpty
            size="small"
            variant="outlined"
            defaultValue=""
            value={formData.department}
            disabled={isFieldsLocked}
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
            renderValue={(selected) =>
              selected || (langu === "en" ? "Select Department" : "বিভাগ নির্বাচন করুন")
            }
            sx={isFieldsLocked ? lockedSelectSx : selectSx}
          >
            <MenuItem value="" disabled>
              {langu === "en" ? "Select Department" : "বিভাগ নির্বাচন করুন"}
            </MenuItem>
            {doctors?.map((item, index) => (
              <MenuItem key={index} value={item?.department}>
                {item?.department}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Doctor */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            {langu === "en" ? "Doctor" : "ডাক্তার"}
          </Typography>
          <Select
            fullWidth
            size="small"
            displayEmpty
            variant="outlined"
            defaultValue=""
            value={formData.doctor}
            disabled={isFieldsLocked}
            onChange={(e) =>
              setFormData({ ...formData, doctor: e.target.value })
            }
            renderValue={(selected) =>
              selected || (langu === "en" ? "Select Doctor" : "ডাক্তার নির্বাচন করুন")
            }
            sx={isFieldsLocked ? lockedSelectSx : selectSx}
          >
            <MenuItem value="" disabled>
              {langu === "en" ? "Select Doctor" : "ডাক্তার নির্বাচন করুন"}
            </MenuItem>
            {department?.doctors?.map((item, index) => (
              <MenuItem key={index} value={item?.name}>
                {item?.name}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Service */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            {langu === "en" ? "Service" : "সেবা"}
          </Typography>
          <Select
            fullWidth
            displayEmpty
            size="small"
            variant="outlined"
            defaultValue=""
            value={formData.service}
            onChange={(e) =>
              setFormData({ ...formData, service: e.target.value })
            }
            renderValue={(selected) =>
              selected || (langu === "en" ? "Select Service" : "সেবা নির্বাচন করুন")
            }
            sx={selectSx}
          >
            <MenuItem value="" disabled>
              {langu === "en" ? "Select Service" : "সেবা নির্বাচন করুন"}
            </MenuItem>
            {[
              langu === "en"
                ? "Consultation / First Visit"
                : "পরামর্শ / প্রথম ভিজিট",
              langu === "en" ? "Follow-up Visit" : "ফলো-আপ ভিজিট",
              langu === "en" ? "Emergency Consultation" : "জরুরি পরামর্শ",
            ].map((item, index) => (
              <MenuItem key={index} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </Grid>

        {/* Message */}
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            {langu === "en" ? "Message" : "বার্তা"}
          </Typography>
          <TextField
            placeholder={langu === "en" ? "Enter message" : "বার্তা লিখুন"}
            variant="outlined"
            multiline
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            rows={8}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "24px",
              },
              width: "100%",
            }}
          />
        </Grid>

        {/* Submit Button */}
        <Grid size={{ xs: 12 }}>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "#2A6498",
              color: "white",
              px: 8,
              py: 1.5,
              "&:hover": {
                bgcolor: "#2A6498",
              },
              maxwidth: 267,
              borderRadius: 100,
              textTransform: "capitalize",
            }}
            onClick={() => handleSubmit()}
          >
            {langu === "en" ? "Submit" : "সাবমিট"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}

export default FormSubmit