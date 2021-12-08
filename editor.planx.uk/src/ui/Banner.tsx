import Box from "@material-ui/core/Box";
import Container from "@material-ui/core/Container";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import classnames from "classnames";
import React from "react";

const useClasses = makeStyles((theme) => ({
  root: {
    position: "relative",
    width: "100%",
    minHeight: theme.spacing(10),
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

function Banner(props: {
  heading: string;
  Icon?: any;
  iconTitle?: string;
  color?: { background: string; text: string };
  children?: React.ReactNode;
}) {
  const classes = useClasses();

  return (
    <Box
      className={classnames(classes.root, !props.color && classes.defaultColor)}
      bgcolor={props.color && props.color.background}
      color={props.color && props.color.text}
      display="flex"
      justifyContent="center"
      textAlign="center"
      px={2}
      py={6}
    >
      <Container maxWidth="md">
        {props.Icon && (
          <props.Icon className={classes.icon} titleAccess={props.iconTitle} />
        )}
        <Typography variant="h1">{props.heading}</Typography>
        {props.children}
      </Container>
    </Box>
  );
}

export default Banner;
