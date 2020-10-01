import React from "react";
import { Link } from "react-navi";
import { Box, Card, Typography, makeStyles, Theme } from "@material-ui/core";

interface Props {
  teams: Array<{
    name: string;
    slug: string;
  }>;
}

const useStyles = makeStyles<Theme>((theme) => ({
  container: {
    backgroundColor: "#2C2C2C",
    flex: 1,
  },
  content: {
    maxWidth: 600,
    margin: "auto",
  },
  title: {
    color: "#fff",
    marginBottom: 60,
  },
  linkBox: {
    textDecoration: "none",
  },
}));

const Teams: React.FC<Props> = ({ teams }) => {
  const styles = useStyles();
  return (
    <Box p={4} className={styles.container}>
      <Box className={styles.content}>
        <Typography className={styles.title} variant="h1">
          Select a team
        </Typography>
        {teams.map(({ name, slug }) => (
          <Link
            href={`/${slug}`}
            key={slug}
            prefetch={false}
            className={styles.linkBox}
          >
            <Box mb={4} p={4} component={Card}>
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
