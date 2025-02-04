import Accordion from "@mui/material/Accordion";
import { styled } from "@mui/material/styles";

export const StyledTeamAccordion = styled(Accordion, {
  shouldForwardProp: (prop) => prop !== "primaryColour",
})<{ primaryColour?: string }>(({ theme, primaryColour }) => ({
  backgroundColor: theme.palette.background.paper,
  outline: `1px solid ${theme.palette.border.light}`,
  width: "100%",
  position: "relative",
  "&::before": {
    display: "none",
  },
  "&::after": {
    content: "''",
    position: "absolute",
    left: 0,
    top: 0,
    width: theme.spacing(1.5),
    height: "100%",
    backgroundColor: primaryColour,
  },
}));
