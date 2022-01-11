import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Box from "@material-ui/core/Box";
import ButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles, Theme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { visuallyHidden } from "@material-ui/utils";
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
    cursor: "pointer",
    marginBottom: theme.spacing(0.5),
    backgroundColor: theme.palette.background.paper,
    "&:hover": {
      background: theme.palette.grey,
    },
    "&:focus-visible": {
      outline: `2px solid ${theme.palette.secondary.dark}`,
    },
  },
  moreInfo: {
    paddingLeft: theme.spacing(2),
    color: theme.palette.text.primary,
  },
  responseText: {
    whiteSpace: "nowrap",
  },
  changeButton: {
    textDecoration: "underline",
  },
  onFocus: {
    outline: `2px solid ${theme.palette.secondary.dark}`,
  },
  removeTopBorder: {
    "&:before": {
      display: "none",
    },
  },
}));

const ResultReason: React.FC<IResultReason> = ({
  id,
  question,
  response,
  showChangeButton = false,
}) => {
  const record = useStore((state) => state.record);
  const [expanded, setExpanded] = React.useState(false);

  const classes = useClasses();

  const hasMoreInfo = question.data.info ?? question.data.policyRef;
  const toggleAdditionalInfo = () => setExpanded(!expanded);

  return (
    <Accordion
      className={classes.root}
      classes={{ root: classes.removeTopBorder }}
      onChange={() => hasMoreInfo && toggleAdditionalInfo()}
      expanded={expanded}
      elevation={0}
      square
    >
      <AccordionSummary
        expandIcon={hasMoreInfo ? <Caret /> : null}
        aria-label={`${question.data.text}: Your answer was: ${response}. Click to expand for more information about this question.`}
        aria-controls={`group-${id}-content`}
        id={`group-${id}-header`}
      >
        <Box
          display="flex"
          alignItems="flex-start"
          flexDirection="column"
          width="100%"
          px={1.5}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Box
              flexGrow={1}
              display="flex"
              alignItems="center"
              color="text.primary"
            >
              <Typography
                variant="body2"
                color="textPrimary"
                id={`questionText-${id}`}
              >
                {question.data.text}{" "}
                <strong className={classes.responseText}>{response}</strong>
              </Typography>
            </Box>
            <Box>
              {showChangeButton && (
                <ButtonBase
                  className={classes.changeButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    record(id);
                  }}
                >
                  Change
                  <span style={visuallyHidden}>
                    {question.data.text || "this answer"}
                  </span>
                </ButtonBase>
              )}
            </Box>
          </Box>
        </Box>
      </AccordionSummary>
      {hasMoreInfo && (
        <AccordionDetails>
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
  );
};
export default ResultReason;
