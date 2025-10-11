import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { styled, Theme } from "@mui/material/styles";
import SvgIcon from "@mui/material/SvgIcon";
import Typography from "@mui/material/Typography";
import React from "react";
import { getContrastTextColor } from "styleUtils";

interface BannerProps {
  heading?: string;
  Icon?: typeof SvgIcon;
  iconTitle?: string;
  color?: { background: string; text: string };
  children?: React.ReactNode;
}

const Root = styled(Box)(({ theme, color, bgcolor }) => ({
  display: "flex",
  justifyContent: "center",
  textAlign: "left",
  padding: theme.spacing(6, 0),
  position: "relative",
  width: "100%",
  minHeight: theme.spacing(10),
  "& a": {
    color: getContrastTextColor(
      (bgcolor as string) || theme.palette.background.paper,
      theme.palette.primary.main,
    ),
  },
  ...(!color && {
    backgroundColor: theme.palette.background.paper,
    color: "currentColor",
  }),
}));

function Banner(props: BannerProps) {
  return (
    <Root
      bgcolor={props.color && props.color.background}
      color={props.color && props.color.text}
    >
      <Container
        maxWidth="contentWrap"
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        {props.Icon && (
          <props.Icon
            sx={{
              marginBottom: (theme: Theme) => theme.spacing(1),
              height: (theme: Theme) => theme.spacing(5),
              width: (theme: Theme) => theme.spacing(5),
              border: "3px solid",
              borderRadius: "50%",
            }}
            titleAccess={props.iconTitle}
          />
        )}
        {props.heading && (
          <Typography variant="h1" sx={{ textWrap: "balance" }}>
            {props.heading}
          </Typography>
        )}
        {props.children}
      </Container>
    </Root>
  );
}

export default Banner;
