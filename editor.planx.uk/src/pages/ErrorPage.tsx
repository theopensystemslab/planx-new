import Box from "@mui/material/Box";
import { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    backgroundColor: "#fff",
    color: "#2C2C2C",
    width: "100%",
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  dashboard: {
    backgroundColor: "#fff",
    color: "#2C2C2C",
    width: "100%",
    maxWidth: 600,
    margin: "auto",
    padding: theme.spacing(8, 0, 4, 0),
  },
}));

const ErrorPage: React.FC<{ title: string }> = ({ title }) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box className={classes.dashboard}>
        <Box pl={2} pb={2}>
          <Typography variant="h1" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body1">
            This bug has been automatically logged and our team will see it
            soon. Refreshing this page will not resolve the issue.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ErrorPage;
