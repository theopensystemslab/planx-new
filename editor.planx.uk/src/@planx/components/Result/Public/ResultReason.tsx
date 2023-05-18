import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
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

const PREFIX = "Result";

const classes = {
  removeTopBorder: `${PREFIX}-removeTopBorder`,
};

const Root = styled(Box)(() => ({
  display: "flex",
  alignItems: "baseline",
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  cursor: "pointer",
  width: "100%",
  marginBottom: theme.spacing(0.5),
  backgroundColor: theme.palette.background.paper,
  "&:hover": {
    background: theme.palette.grey,
  },
  [`& .${classes.removeTopBorder}`]: {
    "&:before": {
      display: "none",
    },
  },
}));

const MoreInfo = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  color: theme.palette.text.primary,
}));

const ChangeLink = styled(Link)(({ theme }) => ({
  marginLeft: theme.spacing(2),
  marginBottom: theme.spacing(0.5),
})) as typeof Link;

const ResultReason: React.FC<IResultReason> = ({
  id,
  question,
  response,
  showChangeButton = false,
}) => {
  const changeAnswer = useStore((state) => state.changeAnswer);
  const [expanded, setExpanded] = React.useState(false);

  const hasMoreInfo = question.data.info ?? question.data.policyRef;
  const toggleAdditionalInfo = () => setExpanded(!expanded);

  const ariaLabel = `${question.data.text}: Your answer was: ${response}. ${
    hasMoreInfo
      ? "Click to expand for more information about this question."
      : ""
  }`;

  return (
    <Root>
      <StyledAccordion
        classes={{ root: classes.removeTopBorder }}
        onChange={() => hasMoreInfo && toggleAdditionalInfo()}
        expanded={expanded}
        elevation={0}
        square
      >
        <AccordionSummary
          expandIcon={hasMoreInfo ? <Caret /> : null}
          aria-label={ariaLabel}
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
                  {question.data.text} <strong>{response}</strong>
                </Typography>
              </Box>
            </Box>
          </Box>
        </AccordionSummary>
        {hasMoreInfo && (
          <AccordionDetails>
            <MoreInfo>
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
            </MoreInfo>
          </AccordionDetails>
        )}
      </StyledAccordion>
      <Box>
        {showChangeButton && (
          <ChangeLink
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
          </ChangeLink>
        )}
      </Box>
    </Root>
  );
};

export default ResultReason;
