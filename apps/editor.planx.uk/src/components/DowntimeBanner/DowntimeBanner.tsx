import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

const DowntimeBannerWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  backgroundColor: theme.palette.error.main,
  color: "#070707",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.5em 0",
  position: "relative",
  zIndex: theme.zIndex.appBar,
}));

const DowntimeBanner: React.FC = () => {
  return (
    <>
      <DowntimeBannerWrapper>
        <Container
          maxWidth="contentWrap"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <BrokenImageIcon />
            <Typography variant="body2" ml={1}>
              <strong>Partial degradation</strong> of some services and features. We are actively working on a fix. Please try again soon.
            </Typography>
          </Box>
        </Container>
      </DowntimeBannerWrapper>
    </>
  );
};

export default DowntimeBanner;
