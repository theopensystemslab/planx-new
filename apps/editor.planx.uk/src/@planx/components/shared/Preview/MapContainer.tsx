import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import { PreviewEnvironment } from "pages/FlowEditor/lib/store/shared";

interface MapContainerProps {
  environment: PreviewEnvironment;
  size?: "large";
}

export const MapContainer = styled(Box)<MapContainerProps>(
  ({ theme, environment, size }) => ({
    padding: theme.spacing(0.5, 0, 0.5, 0),
    width: "100%",
    maxWidth: "none",
    "& my-map": {
      width: "100%",
      // Only increase map size in Published, Preview, and Draft routes
      height:
        size === "large" && environment === "standalone" ? "70vh" : "50vh",
      // Ensure map is not reduced to an unusable height
      minHeight: "400px",
      [theme.breakpoints.up("md")]: {
        minHeight: "480px",
      },
    },
  }),
);

export const MapFooter = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  ...contentFlowSpacing(theme),
}));
