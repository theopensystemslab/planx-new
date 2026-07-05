import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import type { PreviewEnvironment } from "pages/FlowEditor/lib/store/shared";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

interface MapContainerProps {
  environment: PreviewEnvironment;
  size?: "large";
}

export const MapContainer = styled(Box)<MapContainerProps>(({ theme }) => ({
  padding: theme.spacing(0.5, 0, 0.5, 0),
  width: "100%",
  maxWidth: "none",
  "& my-map": {
    "--autocomplete__error__font-weight": FONT_WEIGHT_SEMI_BOLD,
    "--autocomplete__input__max-width": `${theme.breakpoints.values.formWrap}px`,
    "--govuk-error-colour": theme.palette.error.main,
    "--autocomplete__font-family": "Inter",
    width: "100%",
    maxHeight: "80vh",
    // Ensure map is not reduced to an unusable height
    minHeight: "400px",
    [theme.breakpoints.up("md")]: {
      minHeight: "480px",
    },
  },
}));

export const MapFooter = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  ...contentFlowSpacing(theme),
}));
