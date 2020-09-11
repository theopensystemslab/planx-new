import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";

interface Props {
  title?: string;
  children: JSX.Element[] | JSX.Element;
  author?: string;
  Icon?: any;
}

export const modalSectionContentStyles = makeStyles((theme) => ({
  sectionContentGrid: {
    position: "relative",
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  author: {
    fontWeight: 400,
    color: theme.palette.text.secondary,
  },
  sectionContent: {
    flexGrow: 1,
    paddingRight: theme.spacing(6),
  },
  title: {
    opacity: 0.75,
    fontWeight: 600,
  },
  leftGutter: {
    flex: `0 0 ${theme.spacing(6)}px`,
    textAlign: "center",
  },
}));

const ModalSectionContent: React.FC<Props> = ({
  title,
  children,
  author,
  Icon,
}) => {
  const classes = modalSectionContentStyles();
  return (
    <Grid container wrap="nowrap" className={classes.sectionContentGrid}>
      <Grid item className={classes.leftGutter}>
        {Icon && <Icon />}
      </Grid>
      <Grid item className={classes.sectionContent}>
        {title && (
          <Box className={classes.title} fontSize={18} pb={2}>
            {title}
            {author && <span className={classes.author}>by {author}</span>}
          </Box>
        )}
        {children}
      </Grid>
    </Grid>
  );
};
export default ModalSectionContent;
