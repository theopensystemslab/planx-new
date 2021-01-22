import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import MoreInfoIcon from "ui/icons/MoreInfo";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

import MoreInfo from "./MoreInfo";
import MoreInfoSection from "./MoreInfoSection";

interface IQuestionHeader {
  title?: string;
  description?: string;
  info?: string;
  policyRef?: string;
  howMeasured?: string;
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
              <ReactMarkdownOrHtml source={description} />
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
            <ReactMarkdownOrHtml source={info} />
          </MoreInfoSection>
        )}
        {policyRef && (
          <MoreInfoSection title="Source">
            <ReactMarkdownOrHtml source={policyRef} />
          </MoreInfoSection>
        )}
        {howMeasured && (
          <MoreInfoSection title="How is it defined?">
            <ReactMarkdownOrHtml source={howMeasured} />
          </MoreInfoSection>
        )}
      </MoreInfo>

      {img && <img src={img} alt="question image" className={classes.image} />}
    </Box>
  );
};
export default QuestionHeader;
