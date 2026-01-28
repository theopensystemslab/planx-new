import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useRouteContext } from "@tanstack/react-router";
import { capitalize } from "lodash";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { ApplicationPath } from "types";

import { useStore } from "../../../pages/FlowEditor/lib/store";
import { ProgressBar } from "./ProgressBar";

const StyledNavBar = styled("nav")(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  padding: theme.spacing(1.5, 0),
}));

export const SectionNavBar: React.FC = () => {
  const [index, sectionCount, title, hasSections, saveToEmail, path] = useStore(
    (state) => [
      state.currentSectionIndex,
      state.sectionCount,
      state.currentSectionTitle,
      state.hasSections,
      state.saveToEmail,
      state.path,
    ],
  );
  const isSaveAndReturnLandingPage =
    path !== ApplicationPath.SingleSession && !saveToEmail;
  const routeContext = useRouteContext({ strict: false });
  const isContentPage = routeContext?.isContentPage;
  const isViewApplicationPage = routeContext?.isViewApplicationPage;
  const isVisible =
    hasSections &&
    !isSaveAndReturnLandingPage &&
    !isContentPage &&
    !isViewApplicationPage;

  if (!isVisible) return null;

  return (
    <StyledNavBar data-testid="navigation-bar">
      <Container
        maxWidth="contentWrap"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{ whiteSpace: "nowrap" }}
          >{`Section ${index} of ${sectionCount}`}</Typography>
          <Typography component="span">—</Typography>
          <Typography variant="body2" fontWeight={FONT_WEIGHT_SEMI_BOLD}>
            {capitalize(title)}
          </Typography>
        </Box>
        <ProgressBar />
      </Container>
    </StyledNavBar>
  );
};
