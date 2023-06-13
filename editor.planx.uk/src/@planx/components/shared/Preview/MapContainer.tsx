import Box from "@mui/material/Box";
import { styled, Theme } from "@mui/material/styles";
import { PreviewEnvironment } from "pages/FlowEditor/lib/store/shared";

interface MapContainerProps {
  environment: PreviewEnvironment;
  size?: "large";
}

/**
 * Generate a style which increases the map size as the window grows
 * and maintains a consistent right margin
 */
const dynamicMapSizeStyle = (theme: Theme): Record<string, any> => {
  const mainContainerWidth = `${theme.breakpoints.values.contentWrap}px`;
  const pageGutter = "60px";

  const style = {
    width: "100%",
    height: "70vh",
    [theme.breakpoints.up("md")]: {
      width: `calc(100vw - ${pageGutter})`,
    },
    [theme.breakpoints.up("contentWrap")]: {
      width: `calc(${mainContainerWidth} - ${pageGutter})`,
      height: "80vh",
    },
    [theme.breakpoints.up("lg")]: {
      width: `${mainContainerWidth}`,
    },
  };

  return style;
};

export const MapContainer = styled(Box)<MapContainerProps>(
  ({ theme, environment, size }) => ({
    padding: theme.spacing(1, 0, 6, 0),
    width: "100%",
    height: "50vh",
    // Only increase map size in Preview & Unpublished routes
    ...(size === "large" &&
      environment === "standalone" && { ...dynamicMapSizeStyle(theme) }),
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
