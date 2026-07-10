import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";
import { getContrastTextColor } from "styleUtils";
import { DEFAULT_PRIMARY_COLOR } from "theme";

import type { BadgeProps, BadgeSize } from "./types";
import { BadgeVariant } from "./types";

const DIMENSIONS: Record<BadgeSize, { box: number; borderRadius: number }> = {
  default: { box: 54, borderRadius: 6 },
  compact: { box: 46, borderRadius: 4 },
};

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "size",
})<{ size: BadgeSize }>(({ size }) => ({
  width: DIMENSIONS[size].box,
  height: DIMENSIONS[size].box,
  minWidth: DIMENSIONS[size].box,
  borderRadius: DIMENSIONS[size].borderRadius,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  flexShrink: 0,
}));

const Logo = styled("img")({
  maxWidth: "70%",
  maxHeight: "70%",
  objectFit: "contain",
});

const Initial = styled("span", {
  shouldForwardProp: (prop) => prop !== "size",
})<{ size: BadgeSize }>(({ size }) => ({
  fontSize: size === "compact" ? "1.33rem" : "2rem",
  lineHeight: 1,
}));

export const Badge: React.FC<BadgeProps> = (props) => {
  const { size = "default" } = props;

  if (props.variant === BadgeVariant.SourceTemplate) {
    return (
      <Root
        size={size}
        sx={{ backgroundColor: "template.light" }}
        role="img"
        aria-label="Source template"
        data-testid="badge-source-template"
      >
        <StarIcon sx={{ color: "template.icon" }} />
      </Root>
    );
  }

  if (props.variant === BadgeVariant.Custom) {
    return (
      <Root
        size={size}
        sx={{
          backgroundColor: props.backgroundColour,
          color: props.iconColour,
        }}
        data-testid="badge-custom"
      >
        {props.icon}
      </Root>
    );
  }

  const { team } = props;
  const backgroundColour = team.theme.primaryColour || DEFAULT_PRIMARY_COLOR;

  if (team.theme.logo) {
    return (
      <Root
        size={size}
        sx={{ backgroundColor: backgroundColour }}
        role="img"
        aria-label={team.name}
        data-testid="badge-team-logo"
      >
        <Logo src={team.theme.logo} alt="" />
      </Root>
    );
  }

  const textColour = getContrastTextColor(backgroundColour, "#FFFFFF");

  return (
    <Root
      size={size}
      sx={{ backgroundColor: backgroundColour }}
      role="img"
      aria-label={team.name}
      data-testid="badge-team-initial"
    >
      <Initial size={size} sx={{ color: textColour }} aria-hidden>
        {team.name.charAt(0).toUpperCase()}
      </Initial>
    </Root>
  );
};
