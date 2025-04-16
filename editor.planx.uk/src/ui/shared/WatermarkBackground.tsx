import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";
import TestingLogo from "ui/images/testing.svg";

import { useStore } from "../../pages/FlowEditor/lib/store";

type WatermarkBackgroundProps = {
  variant?: "light" | "dark";
  opacity?: number;
};

const Root = styled(Box)(() => ({
  position: "absolute",
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
  shouldForwardProp: (prop) => !["variant", "opacity"].includes(prop as string),
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
  maskImage: `url(${TestingLogo})`,
  maskRepeat: "repeat",
  maskSize: "10% auto",
  maskPosition: "center",
}));

const WatermarkBackground: React.FC<WatermarkBackgroundProps> = ({
  variant = "light",
  opacity = 0.1,
}) => {
  const [isTest] = useStore((state) => [state.isTest]);

  if (!isTest) return null;

  return (
    <Root>
      <div className="sr-only" hidden>
        This is a testing environment for new features. Do not use it to make
        permanent content changes.
      </div>
      <Wrapper>
        <Background variant={variant} opacity={opacity} />
      </Wrapper>
    </Root>
  );
};

export default WatermarkBackground;
