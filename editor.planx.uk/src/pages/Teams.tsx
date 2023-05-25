import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import { Link } from "react-navi";

import type { Team } from "../types";

interface Props {
  teams: Array<Team>;
}

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    backgroundColor: "#2C2C2C",
    color: "#fff",
    width: "100%",
    flex: 1,
    justifyContent: "flex-start",
    // paddingTop: "calc(12vh + 75px)",
    alignItems: "center",
  },
  dashboard: {
    backgroundColor: "#2C2C2C",
    color: "#fff",
    width: "100%",
    maxWidth: 600,
    margin: "auto",
    padding: theme.spacing(8, 0, 4, 0),
  },
  linkBox: {
    textDecoration: "none",
  },
}));

const Teams: React.FC<Props> = ({ teams }) => {
  const classes = useStyles();
  return (
    <Box className={classes.root}>
      <Box className={classes.dashboard}>
        <Box pl={2} pb={2}>
          <Typography variant="h3" component="h1" gutterBottom>
            Select a team
          </Typography>
        </Box>
        {teams.map(({ name, slug }) => (
          <Link
            href={`/${slug}`}
            key={slug}
            prefetch={false}
            className={classes.linkBox}
          >
            <Box mb={2.5} px={2.5} py={3} mx={2} component={Card}>
              <Typography variant="h5" component="h2">
                {name}
              </Typography>
            </Box>
          </Link>
        ))}
      </Box>
    </Box>
  );
};

export default Teams;
