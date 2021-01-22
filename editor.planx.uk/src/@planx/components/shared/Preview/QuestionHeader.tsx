import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import ReactMarkdown from "react-markdown";
import MoreInfoIcon from "ui/icons/MoreInfo";

import MoreInfo from "./MoreInfo";
import MoreInfoSection from "./MoreInfoSection";

interface IQuestionHeader {
  title?: string;
  description?: string;
  info?: string;
  policyRef?: string;
  howMeasured?: string;
  definitionImg?: string;
  img?: string;
}

const useStyles = makeStyles((theme) => ({
  iconButton: {
    padding: 0,
    borderRadius: 12,
  },
  description: {
    "& p": {
      margin: `${theme.spacing(1)}px 0`,
    },
  },
  image: {
    maxWidth: "100%",
  },
}));

const QuestionHeader: React.FC<IQuestionHeader> = ({
  title,
  description,
  info,
  policyRef,
  howMeasured,
  definitionImg,
  img,
}) => {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();

  return (
    <Box mb={2}>
      <Grid container justify="space-between" wrap="nowrap">
        <Grid item>
          {title && (
            <Box
              fontSize="h3.fontSize"
              fontWeight="h3.fontWeight"
              letterSpacing="-0.02em"
              role="heading"
              mr={1}
            >
              {title}
            </Box>
          )}
          {description && (
            <Box role="description" className={classes.description}>
              <ReactMarkdown source={description} />
            </Box>
          )}
        </Grid>
        {!!(info || policyRef || howMeasured) && (
          <Grid item>
            <IconButton
              className={classes.iconButton}
              onClick={() => setOpen(true)}
            >
              <MoreInfoIcon />
            </IconButton>
          </Grid>
        )}
      </Grid>
      <MoreInfo open={open} handleClose={() => setOpen(false)}>
        {info && (
          <MoreInfoSection title="Why does it matter?">
            <ReactMarkdown source={info} />
          </MoreInfoSection>
        )}
        {policyRef && (
          <MoreInfoSection title="Source">
            <ReactMarkdown source={policyRef} />
          </MoreInfoSection>
        )}
        {howMeasured && (
          <MoreInfoSection title="How is it defined?">
            <img
              src={definitionImg}
              alt="definition image"
              className={classes.image}
            />
            <ReactMarkdown source={howMeasured} />
          </MoreInfoSection>
        )}
      </MoreInfo>

      {img && <img src={img} alt="question image" className={classes.image} />}
    </Box>
  );
};
export default QuestionHeader;
