import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { capitalize } from "lodash";
import React from "react";
import { useCurrentRoute } from "react-navi";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { ApplicationPath } from "types";

import { useStore } from "../../../pages/FlowEditor/lib/store";
import { ProgressBar } from "./ProgressBar";

const StyledNavBar = styled("nav")(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  fontSize: 16,
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
}));

const SectionName = styled(Typography)(() => ({
  fontSize: "inherit",
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
}));

const SectionCount = styled(Typography)(() => ({
  fontSize: "inherit",
}));

export const SectionNavBar: React.FC = () => {
  const [index, sectionCount, title, hasSections, saveToEmail, path, node] =
    useStore((state) => [
      state.currentSectionIndex,
      state.sectionCount,
      state.currentSectionTitle,
      state.hasSections,
      state.saveToEmail,
      state.path,
      state.currentCard,
    ]);
  const isSaveAndReturnLandingPage =
    path !== ApplicationPath.SingleSession && !saveToEmail;
  const isContentPage = useCurrentRoute()?.data?.isContentPage;
  const isSectionCard = node?.type == TYPES.Section;
  const isVisible =
    hasSections &&
    !isSaveAndReturnLandingPage &&
    !isContentPage &&
    !isSectionCard;

  if (!isVisible) return null;

  return (
    <StyledNavBar data-testid="navigation-bar">
      <Container
        maxWidth={false}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <SectionCount>{`Section ${index} of ${sectionCount}`}</SectionCount>
        <SectionName>{capitalize(title)}</SectionName>
        <ProgressBar />
      </Container>
    </StyledNavBar>
  );
};
