import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import React from "react";

const svgDataUri = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 135.17 57.69'><path d='M16.66,20.1h13.94v2.65h-5.4v14.82h-3.14v-14.82h-5.4v-2.65Z'/><path d='M33.11,20.1h11.36v2.65h-8.2v4.74h7.61v2.65h-7.61v4.77h8.27v2.65h-11.43v-17.47Z'/><path d='M53.61,22.54c-1.98,0-3.16.96-3.16,2.28-.02,1.46,1.54,2.06,2.97,2.41l1.64.41c2.63.62,5.13,2,5.13,5.03,0,3.08-2.44,5.17-6.63,5.17s-6.65-1.95-6.78-5.43h3.11c.13,1.83,1.66,2.72,3.64,2.72s3.48-1,3.49-2.49c0-1.36-1.25-1.94-3.14-2.42l-1.99-.51c-2.87-.74-4.66-2.18-4.66-4.69,0-3.09,2.75-5.15,6.41-5.15s6.23,2.09,6.29,5.04h-3.05c-.16-1.48-1.41-2.36-3.29-2.36Z'/><path d='M62.09,20.1h13.94v2.65h-5.4v14.82h-3.14v-14.82h-5.4v-2.65Z'/><path d='M81.7,37.56h-3.16v-17.47h3.16v17.47Z'/><path d='M99.89,37.56h-2.81l-8.23-11.9h-.15v11.9h-3.16v-17.47h2.83l8.22,11.91h.15v-11.91h3.15v17.47Z'/><path d='M111.04,22.7c-2.82,0-4.86,2.18-4.86,6.12s2,6.15,4.93,6.15c2.63,0,4.29-1.58,4.34-4.07h-4.03v-2.47h7.09v2.1c0,4.5-3.1,7.28-7.42,7.28-4.82,0-8.09-3.43-8.09-8.96s3.43-8.99,8-8.99c3.86,0,6.83,2.39,7.37,5.82h-3.22c-.56-1.85-2-2.98-4.1-2.98Z'/></svg>`;

type WatermarkBackgroundProps = {
  variant?: "light" | "dark";
  opacity?: number;
  forceVisibility?: boolean;
};

const Root = styled(Box)(() => ({
  position: "fixed",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  zIndex: 0,
  overflow: "hidden",
  pointerEvents: "none",
}));

const Wrapper = styled(Box)(() => ({
  position: "absolute",
  top: "-50%",
  left: "-50%",
  width: "200%",
  height: "200%",
}));

const Background = styled(Box, {
  shouldForwardProp: (prop) =>
    !["variant", "opacity", "forceVisibility"].includes(prop as string),
})<Required<WatermarkBackgroundProps>>(({ theme, variant, opacity }) => ({
  position: "absolute",
  top: "-50%",
  left: "-50%",
  width: "200%",
  height: "200%",
  transform: "rotate(-45deg)",
  transformOrigin: "center",
  backgroundColor:
    variant === "light"
      ? theme.palette.common.white
      : theme.palette.common.black,
  opacity,
  maskImage: `url("${svgDataUri}")`,
  maskRepeat: "repeat",
  maskSize: "10% auto",
  maskPosition: "center",
}));

const WatermarkBackground: React.FC<WatermarkBackgroundProps> = ({
  variant = "light",
  opacity = 0.1,
  forceVisibility = false,
}) => {
  // Only display watermark on Staging, Pizza and Local environments
  const isTestEnvironment = import.meta.env.VITE_APP_ENV !== "production";

  if (!isTestEnvironment && !forceVisibility) return null;

  return (
    <Root>
      <Box sx={visuallyHidden}>
        This is a testing environment for new features. Do not use it to make
        permanent content changes.
      </Box>
      <Wrapper>
        <Background
          variant={variant}
          opacity={opacity}
          forceVisibility={forceVisibility}
        />
      </Wrapper>
    </Root>
  );
};

export default WatermarkBackground;
