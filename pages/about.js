import Head from "next/head";
import Link from "next/link";
import { Box, Grid, IconButton, Paper, Stack, Typography } from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

import { useRouter } from "next/router";

import AboutHeroSection from "./components/AboutHeroSection";
import ManagementTeam from "./components/ManagementTeam";
import { Navigation } from "swiper/modules";
import instance from "./api/api_instance";
import { BeatLoader } from "react-spinners";
import { MyContext } from "@/utils/ContextApi";

function about() {
  const [open, setOpen] = useState(false);
  const [object, setObject] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [prevEl, setPrevEl] = useState(null);
  const [nextEl, setNextEl] = useState(null);
  const { langu } = useContext(MyContext);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await instance.get("/pages/132");

      setData(response.data.body);
      setLoading(false);
    } catch (error) {
      // console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <Head>
          <title>SAJIDA Hospital Ltd</title>
        </Head>
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
      </>
    );
  }

  const HandleMember = (item) => {
    setOpen(true);
    setObject(item);
  };

  const breakpoints = {
    0: { slidesPerView: 1, spaceBetween: 10 },
    380: { slidesPerView: 1, spaceBetween: 15 },
    600: { slidesPerView: 1, spaceBetween: 20 },
    900: { slidesPerView: 3, spaceBetween: 10 },
    1200: { slidesPerView: 3, spaceBetween: 10 },
    1920: { slidesPerView: 4, spaceBetween: 10 },
  };
  const breakpoint = {
    0: { slidesPerView: 1, spaceBetween: 0 },
    380: { slidesPerView: 1, spaceBetween: 15 },
    600: { slidesPerView: 2, spaceBetween: 20 },
    900: { slidesPerView: 3, spaceBetween: 0 },
    1200: { slidesPerView: 4, spaceBetween: 0 },
  };
  const router = useRouter();

  return (
    <>
      <Head>
        <title>SAJIDA Hospital Ltd</title>
      </Head>
      <Box sx={{ width: "90%", maxWidth: "1720px", margin: "0 auto", my: 2 }}>
        <Stack justifyContent={"center"} alignItems={"center"}>
          <Typography
            sx={{ fontSize: { md: 60, xs: 40 }, fontWeight: 500 }}
            dangerouslySetInnerHTML={{
              __html:
                (langu === "en" ? "About " : "আমাদের ") +
                '<span style="color:#12A551">' +
                (langu === "en" ? "Us" : "সম্পর্কে") +
                "</span>",
            }}
          />

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
              {langu === "en"
                ? router?.pathname
                  ? router?.pathname.split("/")
                  : "Not Found"
                : "সম্পর্কে"}
            </Typography>
          </Stack>
        </Stack>

        <Box
          component="img"
          src={`https://engine.sajidahospital.org/${data[0]?.data[0]?._mave?.file_path}`}
          sx={{
            width: "100%",
            mt: 3,
            borderRadius: "16px",

            height: {
              xs: "auto", // 📱 mobile
              sm: "469px", // 💻 tablet+desktop
            },

            objectFit: {
              xs: "contain",
              sm: "cover",
            },

            display: "block",
          }}
        />

        <AboutHeroSection
          image1={`https://engine.sajidahospital.org/${data[1]?.data[0]?._mave?.file_path}`}
          image2={`https://engine.sajidahospital.org/${data[1]?.data[1]?._mave?.file_path}`}
          title1={
            langu === "en"
              ? data[1]?.data[2]?._mave?.title
              : data[1]?.data[2]?._mave?.altTitleFirst
          }
          title2={
            langu === "en"
              ? data[1]?.data[2]?._mave?.altTitle
              : data[1]?.data[2]?._mave?.altTitleSecond
          }
          subtitle1={
            langu === "en"
              ? data[1]?.data[2]?._mave?.description
              : data[1]?.data[2]?._mave?.altDescription
          }
          subtitle2={"Healthcare"}
          description={data[1]?.data[2]?._mave?.altDescription}
          image3={"/assets/about/mission.svg"}
          title3={
            langu === "en"
              ? data[1]?.data[3]?._mave?.title
              : data[1]?.data[3]?._mave?.altTitleFirst
          }
          des1={
            langu === "en"
              ? data[1]?.data[3]?._mave?.description
              : data[1]?.data[3]?._mave?.altDescription
          }
          image4={"/assets/about/vision.svg"}
          title4={
            langu === "en"
              ? data[1]?.data[4]?._mave?.title
              : data[1]?.data[4]?._mave?.altTitleFirst
          }
          des2={
            langu === "en"
              ? data[1]?.data[4]?._mave?.description
              : data[1]?.data[4]?._mave?.altDescription
          }
          button1={langu === "en" ? "Learn More" : "আরও জানুন"}
          disable={router?.pathname}
        />

        <Grid container spacing={{ md: 0, xs: 2 }} mt={5}>
          {data[2]?.data?.map((item, index) => (
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                key={index}
                sx={{
                  padding: 3,
                  boxShadow: "0px 2px 4px rgba(18, 165, 81, 0.05)",
                  borderRadius: "10px",
                  border:
                    activeIndex === index
                      ? "1px solid #2A6498"
                      : "1px solid #EAF0F5",
                  backgroundColor: activeIndex === index ? "#2A6498" : "#fff",
                  color: activeIndex === index ? "#fff" : "inherit",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
              >
                {/* 10+,3,60K+ */}
                <Stack alignItems={"center"} direction={"column"}>
                  <Typography
                    fontSize={langu === "en" ? 40 : 30}
                    dangerouslySetInnerHTML={{
                      __html:
                        (langu === "en"
                          ? item?._mave?.title
                          : item?._mave?.altTitleFirst) || "",
                    }}
                  />
                  <Typography
                    fontSize={16}
                    dangerouslySetInnerHTML={{
                      __html:
                        (langu === "en"
                          ? item?._mave?.description
                          : item?._mave?.altDescription) || "",
                    }}
                  />
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Box
        sx={{
          backgroundImage: "url('/assets/about/backgroundAbout.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          // height: "100vh",
          // width: "90%", maxWidth: "1500px", margin: "0 auto",
          border: "1px solid #EAF0F5",
        }}
      >
        <Box sx={{ width: "90%", maxWidth: "1720px", margin: "0 auto", my: 2 }}>
          <Grid container spacing={4} mt={4} py={3}>
            {/* inner grid 1 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack>
                {/* sajida Hospiat story */}
                <Typography
                  sx={{ color: "#0D5EAE", fontSize: 36, fontWeight: 700 }}
                  dangerouslySetInnerHTML={{
                    __html:
                      (langu === "en"
                        ? data[3]?.data[0]?._mave?.title
                        : data[3]?.data[0]?._mave?.altTitle) || "",
                  }}
                />
                {/* <Typography
                  sx={{ color: "#222222", fontSize: 28 }}
                >{data[3]?.data[0]?._mave?.description.replace(/<[^>]+>/g, '')}
                </Typography> */}
                <Typography
                  sx={{
                    color: "#222222",
                    fontSize: 16,
                    textAlign: "justify",

                    width: "100%",
                  }}
                  dangerouslySetInnerHTML={{
                    __html:
                      langu === "en"
                        ? data[3]?.data[0]?._mave?.description
                        : data[3]?.data[0]?._mave?.altDescription,
                  }}
                />

                <Typography
                  sx={{
                    color: "#222222",
                    fontSize: 16,
                    textAlign: "justify",
                    mt: 2,
                    width: "100%",
                    maxWidth: 600,
                  }}
                ></Typography>
              </Stack>
            </Grid>
            {/* inner grid 2 */}
            <Grid size={{ xs: 12, md: 6 }}>
              <img
                src={`https://engine.sajidahospital.org/${data[3]?.data[1]?._mave?.file_path}`}
                style={{
                  width: "100%",
                  height: 582,
                  borderRadius: 24,
                  objectFit: "cover",
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Box sx={{ width: "90%", maxWidth: "1720px", margin: "0 auto", my: 3 }}>
        <Stack
          direction={{ md: "row", xs: "column" }}
          justifyContent={"space-between"}
          alignItems={"center"}
          mb={2}
        >
          <Stack direction={"column"}>
            {/* our management */}
            <Typography
  fontSize={36}
  fontWeight={700}
  color="#0D5EAE"
  sx={{
    overflow: { xs: "visible", sm: "hidden" },
    whiteSpace: { xs: "normal", sm: "nowrap" },
    textOverflow: { xs: "clip", sm: "ellipsis" },
  }}
  dangerouslySetInnerHTML={{
    __html:
      (langu === "en"
        ? data[4]?.data[0]?._mave?.title
        : data[4]?.data[0]?._mave?.altTitleFirst) || "",
  }}
/>
            {/* <Typography fontSize={28} dangerouslySetInnerHTML={{ __html: (data[4]?.data[0]?._mave?.description || "").replace(/&amp;/g, "&") }} /> */}
          </Stack>
          <Stack
            direction="row"
            // spacing={1}
            justifyContent={"flex-end"}
            alignItems={"flex-end"}
            mb={1}
            sx={{ width: "100%" }} // Ensure the Stack takes full width
          >
            <IconButton ref={(node) => setPrevEl(node)}>
              <img src="/assets/left.svg" width={30} />
            </IconButton>

            <IconButton ref={(node) => setNextEl(node)}>
              <img src="/assets/right.svg" width={30} />
            </IconButton>
          </Stack>
        </Stack>

        {/* image slider */}
        {/* image slider */}
{/* image slider */}
<Swiper
  modules={[Navigation]}
  breakpoints={{
    0:    { slidesPerView: 1, spaceBetween: 0 },
    900:  { slidesPerView: 3, spaceBetween: 10 },
    1200: { slidesPerView: 3, spaceBetween: 10 },
    1920: { slidesPerView: 4, spaceBetween: 10 },
  }}
  navigation={{
    prevEl,
    nextEl,
  }}
  slideToClickedSlide={false}
  roundLengths={true}
  onBeforeInit={(swiper) => {
    swiper.params.navigation.prevEl = prevEl;
    swiper.params.navigation.nextEl = nextEl;
  }}
>
  {data[4]?.data[1]?._mave?.cards.map((item, index) => {
    return (
      <SwiperSlide
        key={index}
        onClick={() => HandleMember(item)}
        style={{
          height: "auto",        // ← was 540, now auto so text has room
        }}
      >
        <div
          style={{
            padding: 16,
            borderRadius: 16,
            border: "1px solid #EAF0F5",
            boxShadow: "0px 2px 4px rgba(18, 165, 81, 0.05)",
            boxSizing: "border-box",
            cursor: "pointer",
          }}
        >
          <Box
            sx={{
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <img
              src={`https://engine.sajidahospital.org/${item.media_files?.file_path}`}
              width={"100%"}
              style={{
                cursor: "pointer",
                height: "auto",
                aspectRatio: "3 / 4",
                objectFit: "cover",
                objectPosition: "center top",
                display: "block",
              }}
            />
            <Box
              sx={{
                bgcolor: "#2A6498",
                px: 2,
                py: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: 16, md: 18 },
                  fontWeight: 700,
                  color: "#fff",
                }}
                dangerouslySetInnerHTML={{
                  __html: langu === "en" ? item.title_en : item.altTitle,
                }}
              />
            </Box>
          </Box>
        </div>
      </SwiperSlide>
    );
  })}
</Swiper>
      </Box>

      {/* CERTIFICATIONS & ACCREDITATIONS - commented out
      <Box sx={{ width: "90%", maxWidth: "1720px", margin: "0 auto", my: 2 }}>
        <Stack
          direction={{ md: "row", xs: "column" }}
          justifyContent={"space-between"}
          alignItems={"center"}
          mb={2}
        >
          <Stack direction={"column"}>
            <Typography fontSize={36} fontWeight={700} color="#0D5EAE" dangerouslySetInnerHTML={{ __html: (langu === "en" ? data[5]?.data[0]?._mave?.title : data[5]?.data[0]?._mave?.altTitleFirst) || "" }} />
            <Typography fontSize={28} dangerouslySetInnerHTML={{ __html: (data[5]?.data[0]?._mave?.description || "").replace(/&amp;/g, "") }} />
          </Stack>
          <Stack
            direction="row"
            justifyContent={"flex-end"}
            alignItems={"flex-end"}
            mb={1}
            sx={{ width: "100%" }}
          >
            <IconButton ref={prevRef1}>
              <img src="/assets/left.svg" alt="" width={30} />
            </IconButton>
            <IconButton ref={nextRef1}>
              <img src="/assets/right.svg" alt="" width={30} />
            </IconButton>
          </Stack>
        </Stack>
        <Swiper
          style={{ marginTop: 20 }}
          breakpoints={breakpoint}
          modules={[Navigation]}
          navigation={{
            prevEl: prevRef1.current,
            nextEl: nextRef1.current,
          }}
          onInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef1.current;
            swiper.params.navigation.nextEl = nextRef1.current;
            swiper.navigation?.init();
            swiper.navigation?.update();
          }}
          pagination={{ clickable: true }}
          className="mySwiper"
        >
          {data[5]?.data[1]?._mave?.medias?.map((item, index) => (
            <SwiperSlide key={index}>
              <img
                src={`https://engine.sajidahospital.org/${item.file_path}`}
                width="100%"
                alt={item.title || `slide-${index}`}
                style={{ borderRadius: 16 }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
      */}
      <ManagementTeam open={open} setOpen={setOpen} data={object} />
    </>
  );
}

export default about;
