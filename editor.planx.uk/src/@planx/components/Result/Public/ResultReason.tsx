import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import { visuallyHidden } from "@mui/utils";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import Caret from "ui/icons/Caret";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

import type { Node } from "../../../../types";

interface IResultReason {
  id: string;
  question: Node;
  response: string;
  showChangeButton?: boolean;
}

const useClasses = makeStyles((theme: Theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    margin: "0",
    marginRight: theme.spacing(7),
    position: "relative",
  },
  accordion: {
    width: "100%",
    backgroundColor: "transparent",
    position: "relative",
    margin: "0",
    "&:hover": {
      background: theme.palette.grey,
    },
    "&::after": {
      content: "''",
      position: "absolute",
      bottom: "0",
      left: "0",
      width: "100%",
      height: "1px",
      backgroundColor: theme.palette.secondary.main,
      zIndex: "2",
    },
    "&.Mui-expanded": {
      margin: "0",
    },
  },
  changeLink: {
    position: "absolute",
    right: theme.spacing(-7),
    top: 0,
    height: "100%",
    minWidth: theme.spacing(7),
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    flexShrink: "0",
    "& button": {
      padding: "1em 0.25em",
      fontSize: "inherit",
    },
  },
  removeTopBorder: {
    "&:before": {
      display: "none",
    },
  },
  summary: {
    padding: "0",
    margin: "0",
    minHeight: "0",
    "&.Mui-expanded": {
      minHeight: "0",
    },
    "& > div": {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      transition: "none",
    },
    "& svg": {
      color: theme.palette.text.secondary,
    },
  },
  summaryWrap: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(2),
    margin: "0",
  },
  accordionFlag: {
    content: "''",
    position: "absolute",
    top: "0",
    left: "0",
    width: "10px",
    height: "100%",
    backgroundColor: "#82E6A1",
    zIndex: "1",
  },
  accordionHeader: {
    position: "relative",
  },
  accordionDetails: {
    padding: "0",
  },
  moreInfo: {
    color: theme.palette.text.primary,
    paddingLeft: theme.spacing(3),
    paddingBottom: theme.spacing(1),
  },
}));

const ResultReason: React.FC<IResultReason> = ({
  id,
  question,
  response,
  showChangeButton = false,
}) => {
  const changeAnswer = useStore((state) => state.changeAnswer);
  const [expanded, setExpanded] = React.useState(false);

  const classes = useClasses();

  const hasMoreInfo = question.data.info ?? question.data.policyRef;
  const toggleAdditionalInfo = () => setExpanded(!expanded);

  const ariaLabel = `${question.data.text}: Your answer was: ${response}. ${
    hasMoreInfo
      ? "Click to expand for more information about this question."
      : ""
  }`;

  return (
    <Box className={classes.root}>
      <Accordion
        className={classes.accordion}
        classes={{ root: classes.removeTopBorder }}
        onChange={() => hasMoreInfo && toggleAdditionalInfo()}
        expanded={expanded}
        elevation={0}
        square
      >
        <Box className={classes.accordionHeader}>
          <AccordionSummary
            className={classes.summary}
            expandIcon={hasMoreInfo ? <Caret /> : null}
            aria-label={ariaLabel}
            aria-controls={`group-${id}-content`}
            id={`group-${id}-header`}
          >
            <Box
              className={classes.summaryWrap}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Typography
                variant="body2"
                color="textPrimary"
                id={`questionText-${id}`}
              >
                {question.data.text} <br />
                <strong>{response}</strong>
              </Typography>
            </Box>
          </AccordionSummary>
          <Box className={classes.changeLink}>
            <Box>
              {showChangeButton && (
                <Link
                  component="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    changeAnswer(id);
                  }}
                >
                  Change
                  <span style={visuallyHidden}>
                    your response to {question.data.text || "this question"}
                  </span>
                </Link>
              )}
            </Box>
          </Box>
        </Box>
        {hasMoreInfo && (
          <AccordionDetails className={classes.accordionDetails}>
            <Box className={classes.moreInfo}>
              {question.data.info && (
                <ReactMarkdownOrHtml
                  source={question.data.info}
                  openLinksOnNewTab
                />
              )}
              {question.data.policyRef && (
                <ReactMarkdownOrHtml
                  source={question.data.policyRef}
                  openLinksOnNewTab
                />
              )}
            </Box>
          </AccordionDetails>
        )}
      </Accordion>
      <Box className={classes.accordionFlag}></Box>
    </Box>
  );
};

export default ResultReason;
