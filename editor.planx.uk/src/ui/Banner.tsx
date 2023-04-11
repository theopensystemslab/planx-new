import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import classnames from "classnames";
import { hasFeatureFlag } from "lib/featureFlags";
import React from "react";
import { getContrastTextColor } from "styleUtils";

const useClasses = makeStyles<Theme, BannerProps>((theme) => ({
  root: {
    position: "relative",
    width: "100%",
    minHeight: theme.spacing(10),
    "& a": {
      color: (props) =>
        getContrastTextColor(
          props.color?.background || theme.palette.background.paper,
          theme.palette.primary.main
        ),
    },
  },
  defaultColor: {
    backgroundColor: theme.palette.background.paper,
    color: "currentColor",
  },
  icon: {
    marginBottom: theme.spacing(2),
    height: theme.spacing(6),
    width: theme.spacing(6),
  },
}));

interface BannerProps {
  heading?: string;
  Icon?: any;
  iconTitle?: string;
  color?: { background: string; text: string };
  children?: React.ReactNode;
}

function Banner(props: BannerProps) {
  const classes = useClasses(props);
  const isUsingAltTheme = hasFeatureFlag("ALT_THEME");

  return (
    <Box
      className={classnames(classes.root, !props.color && classes.defaultColor)}
      bgcolor={props.color && props.color.background}
      color={props.color && props.color.text}
      display="flex"
      justifyContent="center"
      textAlign={isUsingAltTheme ? "left" : "center"}
      px={isUsingAltTheme ? 0 : 2}
      py={6}
    >
      <Container maxWidth="md">
        {props.Icon && (
          <props.Icon className={classes.icon} titleAccess={props.iconTitle} />
        )}
        {props.heading && <Typography variant="h1">{props.heading}</Typography>}
        {props.children}
      </Container>
    </Box>
  );
}

export default Banner;
