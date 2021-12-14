import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import useAnalyticsTracking from "pages/FlowEditor/lib/useAnalyticsTracking";
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
  definitionImg?: string;
  img?: string;
}

const useStyles = makeStyles((theme) => ({
  iconButton: {
    "&:hover": {
      backgroundColor: "transparent",
    },
    "&:focus-visible": {
      outline: `2px solid ${theme.palette.secondary.dark}`,
    },
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
  const { trackHelpClick } = useAnalyticsTracking();

  const handleHelpClick = () => {
    setOpen(true);
    trackHelpClick(); // This returns a promise but we don't need to await for it
  };

  return (
    <Box mb={2}>
      <Grid container justify="space-between" wrap="nowrap">
        <Grid item>
          {title && (
            <Box letterSpacing="-0.02em" mr={1} pt={1.5}>
              <Typography variant="h3" role="heading" aria-level={1}>
                {title}
              </Typography>
            </Box>
          )}
          {description && (
            <Box className={classes.description}>
              <ReactMarkdownOrHtml source={description} />
            </Box>
          )}
        </Grid>
        {!!(info || policyRef || howMeasured) && (
          <Grid item>
            <IconButton
              disableRipple
              className={classes.iconButton}
              title={`More information`}
              aria-label={`See more information about "${title}"`}
              onClick={handleHelpClick}
            >
              <MoreInfoIcon viewBox="0 0 30 30" />
            </IconButton>
          </Grid>
        )}
      </Grid>
      <MoreInfo open={open} handleClose={() => setOpen(false)}>
        {info && (
          <MoreInfoSection title="Why does it matter?">
            <ReactMarkdownOrHtml source={info} openLinksOnNewTab />
          </MoreInfoSection>
        )}
        {policyRef && (
          <MoreInfoSection title="Source">
            <ReactMarkdownOrHtml source={policyRef} openLinksOnNewTab />
          </MoreInfoSection>
        )}
        {howMeasured && (
          <MoreInfoSection title="How is it defined?">
            <>
              {definitionImg && (
                <img
                  src={definitionImg}
                  alt="definition image"
                  className={classes.image}
                />
              )}
              <ReactMarkdownOrHtml source={howMeasured} openLinksOnNewTab />
            </>
          </MoreInfoSection>
        )}
      </MoreInfo>

      {img && <img src={img} alt="question image" className={classes.image} />}
    </Box>
  );
};
export default QuestionHeader;
