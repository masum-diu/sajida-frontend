import {
  Paper,
  Typography,
  Stack,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import React, { useContext, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay, Navigation } from "swiper/modules";
import { MyContext } from "@/utils/ContextApi";

const SECTION_COLOR = "#2A6498";
const TEXT_MUTED = "#6B7280";
const BORDER_COLOR = "#E5E7EB";
const SECTION_SOFT = alpha(SECTION_COLOR, 0.12);

const SWIPER_BREAKPOINTS = {
  0: { slidesPerView: 1, spaceBetween: 16 },
  600: { slidesPerView: 2, spaceBetween: 20 },
  960: { slidesPerView: 4, spaceBetween: 24 },
  1280: { slidesPerView: 4, spaceBetween: 24 },
  1920: { slidesPerView: 4, spaceBetween: 24 },
};

function Testimony({ event }) {
  const theme = useTheme();
  const { langu } = useContext(MyContext);
  const [open, setOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const fullScreenDialog = useMediaQuery(theme.breakpoints.down("sm"));

  const handleOpenDetails = (item) => {
    setSelectedCard(item);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedCard(null);
  };

  const sectionTitle =
    langu === "en" ? event?.title_en : event?.altTitle;
  const cards = event?.cards ?? [];

  const dialogTitleHtml = selectedCard
    ? (langu === "en" ? selectedCard.title_en : selectedCard.altTitle) || ""
    : "";
  const dialogBodyHtml = selectedCard
    ? (langu === "en"
        ? selectedCard.description_en
        : selectedCard.altDescription) || ""
    : "";

  return (
    <Stack component="section" aria-label="Patient testimonials" spacing={3}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        <Typography
          component="h2"
          sx={{
            color: SECTION_COLOR,
            fontSize: { xs: 28, sm: 32, md: 36 },
            fontWeight: 700,
            lineHeight: 1.2,
          }}
          dangerouslySetInnerHTML={{ __html: sectionTitle || "" }}
        />
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconButton
            ref={prevRef}
            aria-label={langu === "en" ? "Previous testimonial" : "আগের টেস্টিমোনিয়াল"}
            sx={{
              color: SECTION_COLOR,
              "&:hover": { backgroundColor: "action.hover", opacity: 0.8 },
            }}
          >
            <img src="/assets/left.svg" alt="" width={24} height={24} />
          </IconButton>
          <IconButton
            ref={nextRef}
            aria-label={langu === "en" ? "Next testimonial" : "পরবর্তী টেস্টিমোনিয়াল"}
            sx={{
              color: SECTION_COLOR,
              "&:hover": { backgroundColor: "action.hover" },
            }}
          >
            <img src="/assets/right.svg" alt="" width={24} height={24} />
          </IconButton>
        </Stack>
      </Stack>

      <Swiper
        style={{ marginTop: 8 }}
        breakpoints={SWIPER_BREAKPOINTS}
        modules={[Navigation, Autoplay]}
        loop={cards.length > 1}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
          swiper.navigation?.init();
          swiper.navigation?.update();
        }}
        className="mySwiper"
      >
        {cards.map((card, index) => {
          const fullName =
            langu === "en" ? card.title_bn : card.altTitle;

          return (
            <SwiperSlide key={card.id ?? index}>
              <Paper
                elevation={0}
                sx={{
                  height: "100%",
                  minHeight: 150,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  border: `1px solid ${BORDER_COLOR}`,
                  overflow: "hidden",
                  p: 2.5,
                  transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                    borderColor: "divider",
                  },
                }}
              >
                <Typography
                  sx={{
                    flex: 1,
                    fontSize: 16,
                    lineHeight: 1.6,
                    color: TEXT_MUTED,
                    display: "-webkit-box",
                    WebkitLineClamp: 5,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    mb: 2,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: (langu === "en"
                      ? card.title_en
                      : card.description_bn
                    )?.replace(/&quot;/g, '"') || "",
                  }}
                />
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  gap={1.5}
                >
                  <Button
                    variant="contained"
                    onClick={() => handleOpenDetails(card)}
                    sx={{
                      minWidth: 109,
                      height: 40,
                      fontWeight: 600,
                      borderRadius: "100px",
                      fontSize: 14,
                      textTransform: "capitalize",
                      backgroundColor: SECTION_COLOR,
                      "&:hover": {
                        backgroundColor: "#234a7a",
                        boxShadow: "none",
                      },
                    }}
                  >
                    {langu === "en" ? "Details" : "বিস্তারিত"}
                  </Button>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: SECTION_COLOR,
                    }}
                    dangerouslySetInnerHTML={{ __html: fullName || "" }}
                  />
                </Stack>
              </Paper>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <Dialog
        open={open}
        onClose={handleCloseDialog}
        fullScreen={fullScreenDialog}
        maxWidth="md"
        fullWidth
        scroll="paper"
        aria-labelledby="testimony-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: fullScreenDialog ? 0 : { xs: 2, sm: 3 },
            maxHeight: fullScreenDialog ? "100%" : { xs: "min(92vh, 720px)", sm: "min(88vh, 680px)" },
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: fullScreenDialog
              ? "none"
              : `0 24px 48px ${alpha("#0f172a", 0.12)}`,
          },
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            height: 4,
            bgcolor: SECTION_COLOR,
            width: "100%",
          }}
        />
        <DialogTitle
          id="testimony-dialog-title"
          component="div"
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            pt: { xs: 2, sm: 2.5 },
            pb: 1,
            px: { xs: 2, sm: 3 },
            pr: { xs: 1, sm: 2 },
          }}
        >
          <Typography
            component="div"
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: { xs: "1.05rem", sm: "1.2rem" },
              fontWeight: 600,
              color: "#111827",
              lineHeight: 1.45,
              letterSpacing: "-0.01em",
            }}
            dangerouslySetInnerHTML={{ __html: dialogTitleHtml }}
          />
          <IconButton
            onClick={handleCloseDialog}
            aria-label={langu === "en" ? "Close" : "বন্ধ"}
            size="small"
            sx={{
              mt: -0.5,
              color: TEXT_MUTED,
              "&:hover": {
                color: SECTION_COLOR,
                bgcolor: SECTION_SOFT,
              },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            flex: 1,
            overflowY: "auto",
            px: { xs: 2, sm: 3 },
            pt: 0,
            pb: { xs: 2, sm: 2.5 },
            borderTop: `1px solid ${BORDER_COLOR}`,
          }}
        >
          <Box
            sx={{
              mt: { xs: 2, sm: 2.5 },
              pl: { xs: 0, sm: 1.5 },
              borderLeft: {
                xs: "none",
                sm: `3px solid ${alpha(SECTION_COLOR, 0.25)}`,
              },
            }}
          >
            <Typography
              component="div"
              sx={{
                fontSize: { xs: "0.9375rem", sm: "1rem" },
                lineHeight: { xs: 1.72, sm: 1.75 },
                color: TEXT_MUTED,
                textAlign: "left",
                "& p": { mb: 0 },
              }}
              dangerouslySetInnerHTML={{ __html: dialogBodyHtml }}
            />
          </Box>
        </DialogContent>

        <Box
          sx={{
            flexShrink: 0,
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 2 },
            pt: { xs: 1.5, sm: 1.5 },
            borderTop: `1px solid ${BORDER_COLOR}`,
            bgcolor: alpha("#F9FAFB", 0.9),
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            disableElevation
            sx={{
              minWidth: { xs: "100%", sm: 120 },
              height: 42,
              textTransform: "capitalize",
              fontWeight: 600,
              borderRadius: 1.5,
              fontSize: 15,
              bgcolor: SECTION_COLOR,
              "&:hover": {
                bgcolor: "#234a7a",
              },
            }}
          >
            {langu === "en" ? "Close" : "বন্ধ"}
          </Button>
        </Box>
      </Dialog>
    </Stack>
  );
}

export default Testimony;
