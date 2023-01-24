import Box from "@mui/material/Box";
import { styled, Theme } from "@mui/material/styles";
import { PreviewEnvironment } from "pages/FlowEditor/lib/store/shared";

interface MapContainerProps {
  environment: PreviewEnvironment;
  interactive?: boolean;
}

/**
 * Generate a style which increases the map size as the window grows
 * and maintains a consistent right margin
 */
const dynamicMapSizeStyle = (theme: Theme): Record<string, any> => {
  const mainContainerWidth = `${theme.breakpoints.values.md}px`;
  const mainContainerMargin = `((100vw - ${mainContainerWidth}) / 2)`;
  const mapMarginRight = "150px";

  const style = {
    [theme.breakpoints.up("md")]: {
      height: "70vh",
      width: `calc(${mainContainerMargin} + ${mainContainerWidth} - ${mapMarginRight})`,
    },
  };

  return style;
};

export const MapContainer = styled(Box)<MapContainerProps>(
  ({ theme, environment, interactive }) => ({
    padding: theme.spacing(1, 0, 6, 0),
    width: "100%",
    height: "50vh",
    // Only increase map size in Preview & Unpublished routes for "interactive" maps like drawing
    ...(environment === "standalone" &&
      Boolean(interactive) && { ...dynamicMapSizeStyle(theme) }),
    "& my-map": {
      width: "100%",
      height: "100%",
    },
  })
);

export const MapFooter = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  paddingTop: theme.spacing(3),
}));
