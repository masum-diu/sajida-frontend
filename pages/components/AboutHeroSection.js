import { Button, Grid, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll } from "framer-motion";

function AboutHeroSection({
  image1,
  image2,
  title1,
  title2,
  subtitle1,
  subtitle2,
  description,
  image3,
  image4,
  title3,
  title4,
  des1,
  des2,
  button1,
}) {
  const router = useRouter();
  const { scrollY } = useScroll();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ detect mobile
  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ✅ scroll animation trigger (desktop only)
  useEffect(() => {
    if (isMobile) return;

    const unsubscribe = scrollY.on("change", (val) => {
      setIsScrolled(val > 100);
    });

    return () => unsubscribe();
  }, [scrollY, isMobile]);

  return (
    <Grid container spacing={6} mt={6}>
      
      {/* ✅ IMAGE SECTION (mobile e niche jabe) */}
      <Grid size={{ xs: 12, md: 6 }} order={{ xs: 2, md: 1 }}>
        <Grid container spacing={2}>
          
          <Grid size={6}>
            {isMobile ? (
              <img
                src={image1}
                style={{ width: "100%", borderRadius: 16 }}
              />
            ) : (
              <motion.img
                initial={{ opacity: 0, x: -100, scale: 0.8 }}
                animate={{
                  opacity: isScrolled ? 1 : 0,
                  x: isScrolled ? 0 : -100,
                  scale: isScrolled ? 1 : 0.8,
                }}
                transition={{ duration: 0.8 }}
                src={image1}
                style={{ width: "100%", borderRadius: 16 }}
              />
            )}
          </Grid>

          <Grid size={6}>
            {isMobile ? (
              <img
                src={image2}
                style={{ width: "100%", borderRadius: 16 }}
              />
            ) : (
              <motion.img
                initial={{ opacity: 0, x: -100, scale: 0.8 }}
                animate={{
                  opacity: isScrolled ? 1 : 0,
                  x: isScrolled ? 0 : -100,
                  scale: isScrolled ? 1 : 0.8,
                }}
                transition={{ duration: 0.8, delay: 0.2 }}
                src={image2}
                style={{ width: "100%", borderRadius: 16 }}
              />
            )}
          </Grid>

        </Grid>
      </Grid>

      {/* ✅ CONTENT SECTION (mobile e age asbe) */}
      <Grid size={{ xs: 12, md: 6 }} order={{ xs: 1, md: 2 }}>
        
        {isMobile ? (
          <div>
            <Typography
              sx={{
                fontSize: { xs: 28, md: 36 },
                fontWeight: 700,
                color: "#0D5EAE",
              }}
              dangerouslySetInnerHTML={{
                __html: `${title2 || ""} <span style="color:#12A551">${title1 || ""}</span>`,
              }}
            />

            <Typography dangerouslySetInnerHTML={{ __html: subtitle1 }} />

            <Stack
              spacing={4}
              direction="column"
              mt={2}
            >
              {/* Mission */}
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <img src={image3} width={40} />
                  <Typography fontWeight={600} dangerouslySetInnerHTML={{ __html: title3 }} />
                </Stack>
                <Typography dangerouslySetInnerHTML={{ __html: des1 }} />
              </Stack>

              {/* Vision */}
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <img src={image4} width={35} />
                  <Typography fontWeight={600} dangerouslySetInnerHTML={{ __html: title4 }} />
                </Stack>
                <Typography dangerouslySetInnerHTML={{ __html: des2 }} />
              </Stack>
            </Stack>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{
              opacity: isScrolled ? 1 : 0,
              x: isScrolled ? 0 : 100,
              scale: isScrolled ? 1 : 0.8,
            }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              sx={{
                fontSize: 36,
                fontWeight: 700,
                color: "#0D5EAE",
              }}
              dangerouslySetInnerHTML={{
                __html: `${title2 || ""} <span style="color:#12A551">${title1 || ""}</span>`,
              }}
            />

            <Typography dangerouslySetInnerHTML={{ __html: subtitle1 }} />

            <Stack
              spacing={6}
              direction="row"
              mt={3}
            >
              {/* Mission */}
              <Stack width="50%" spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <img src={image3} width={50} />
                  <Typography fontWeight={600} dangerouslySetInnerHTML={{ __html: title3 }} />
                </Stack>
                <Typography dangerouslySetInnerHTML={{ __html: des1 }} />
              </Stack>

              {/* Vision */}
              <Stack width="50%" spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <img src={image4} width={40} />
                  <Typography fontWeight={600} dangerouslySetInnerHTML={{ __html: title4 }} />
                </Stack>
                <Typography dangerouslySetInnerHTML={{ __html: des2 }} />
              </Stack>
            </Stack>

           {/* <Button
              onClick={() => router.push("/about")}
              variant="outlined"
              sx={{
                mt: 4,
                borderRadius: 100,
              }}
            >
              {button1}
            </Button>*/}
          </motion.div>
        )}

      </Grid>
    </Grid>
  );
}

export default AboutHeroSection;