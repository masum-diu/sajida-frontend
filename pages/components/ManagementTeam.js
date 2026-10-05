import { Drawer, Grid, IconButton, Typography } from "@mui/material";
import React, { useContext } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { MyContext } from "@/utils/ContextApi";

function ManagementTeam({ open, setOpen, data }) {
  const { langu } = useContext(MyContext);
  const member = data?._mave || data || {};
  const memberTitle = langu === "en" ? member?.title_en : member?.altTitle;
  const memberDescription =
    langu === "en" ? member?.description_en : member?.altDescription;
  const memberImage = member?.media_files?.file_path;
  return (
    <Drawer
      anchor="left"
      variant="temporary"
      PaperProps={{
        sx: {
          width: "100%",
          overflow: "hidden",
          height: "100vh", // Drawer full viewport height
          bgcolor: "#2A6498",
        },
      }}
      open={open}
      onClose={() => setOpen(false)}
    >
      <Grid
        container
        sx={{
          width: "100vw",
          minHeight: "100vh",
          height: "auto",
          overflow: "auto",
          alignContent: "flex-start", // prevent the auto-height text row from stretching to fill leftover space
        }}
      >
        {/* Image Section */}
        <Grid
          item
          size={{ xs: 12, md: 6 }}
          sx={{
            position: "relative",
            width: "100%",
            height: { xs: "45vh", md: "100vh" }, // shorter on mobile so text is visible without excess scroll
          }}
        >
          {/* Close icon on mobile */}
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              display: { xs: "flex", md: "none" },
              position: "absolute",
              top: 10,
              right: 10,
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
              color: "#000",
              bgcolor: "#fff",
              zIndex: 10,
            }}
          >
            <CloseIcon />
          </IconButton>

          <img
            src={`https://engine.sajidahospital.org/${memberImage || ""}`}
            alt={member?.title_en || "management member"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top"
            }}
          />
        </Grid>

        {/* Text Section */}
        <Grid
          item
          size={{ xs: 12, md: 6 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            height: { xs: "auto", md: "100vh" },
          }}
        >
          {/* Close icon on desktop */}
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              display: { xs: "none", md: "flex" },
              alignSelf: "flex-end",
              m: 2,
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
              color: "#000",
              bgcolor: "#fff",
            }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            sx={{
              fontSize: { md: 44, xs: 26 },
              fontWeight: 600,
              color: "#fff",
              mx: 2.5,
              mt: { xs: 2, md: 1 },
              mb: { xs: 1, md: 1.5 },
            }}
            dangerouslySetInnerHTML={{ __html: memberTitle || "" }}
          />
          <Typography
            sx={{
              fontSize: { md: 18, xs: 16 },
              color: "#fff",
              lineHeight: 1.6,
              textAlign: "justify",
              mx: 2.5,
              mb: 3,
              overflowY: "auto",
            }}
            dangerouslySetInnerHTML={{
              __html: memberDescription || "",
            }}
          />
        </Grid>
      </Grid>
    </Drawer>
  );
}

export default ManagementTeam;
