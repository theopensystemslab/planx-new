import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box, { BoxProps } from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analyticsProvider";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useRef } from "react";
import Caret from "ui/icons/Caret";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml";

import type { Node } from "../../../../types";

interface IResultReason {
  id: string;
  question: Node;
  response: string;
  showChangeButton?: boolean;
  flagColor?: string;
}

const PREFIX = "Result";

const classes = {
  removeTopBorder: `${PREFIX}-removeTopBorder`,
};

const Root = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  margin: "0",
  marginRight: theme.spacing(8),
  position: "relative",
}));

const ChangeLink = styled(Box)(({ theme }) => ({
  position: "absolute",
  right: theme.spacing(-8),
  top: 0,
  display: "flex",
  alignContent: "center",
  "& button": {
    padding: "1em 0.25em",
    fontSize: "inherit",
  },
}));

const MoreInfo = styled(Box)(({ theme }) => ({
  color: theme.palette.text.primary,
  paddingLeft: theme.spacing(3),
  paddingBottom: theme.spacing(1),
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
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
    color: theme.palette.primary.main,
  },
}));

const SummaryWrap = styled(Box)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(2),
  margin: "0",
}));

const AccordionFlag = styled(Box, {
  shouldForwardProp: (prop) => prop !== "flagColor",
})<BoxProps & { flagColor?: string }>(({ theme, flagColor }) => ({
  content: "''",
  position: "absolute",
  top: "0",
  left: "0",
  width: "10px",
  height: "100%",
  backgroundColor: flagColor || theme.palette.background.paper,
  zIndex: "1",
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
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
    backgroundColor: theme.palette.border.main,
    zIndex: "2",
  },
  "&.Mui-expanded": {
    margin: "0",
  },
  [`&.${classes.removeTopBorder}`]: {
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
  flagColor,
}) => {
  const changeAnswer = useStore((state) => state.changeAnswer);
  const accordionSummaryRef = useRef<HTMLDivElement | null>(null);

  const hasMoreInfo = question.data.info ?? question.data.policyRef;

  const ariaLabel = `${question.data.text}: Your answer was: ${response}. ${
    hasMoreInfo
      ? "Click to expand for more information about this question."
      : ""
  }`;

  const { trackBackwardsNavigation } = useAnalyticsTracking();

  const handleChangeAnswer = (id: string) => {
    trackBackwardsNavigation("change", id);
    changeAnswer(id);
  };

  return (
    <Root>
      <StyledAccordion
        classes={{ root: classes.removeTopBorder }}
        elevation={0}
        square
      >
        <StyledAccordionSummary
          expandIcon={hasMoreInfo ? <Caret /> : null}
          aria-label={ariaLabel}
          aria-controls={`group-${id}-content`}
          id={`group-${id}-header`}
          ref={accordionSummaryRef}
        >
          <SummaryWrap
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Typography
              variant="body1"
              color="textPrimary"
              id={`questionText-${id}`}
            >
              {question.data.text} <br />
              <strong>{response}</strong>
            </Typography>
          </SummaryWrap>
        </StyledAccordionSummary>
        {hasMoreInfo && (
          <AccordionDetails sx={{ py: 1, px: 0 }}>
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
      <ChangeLink
        sx={{
          height: accordionSummaryRef.current?.clientHeight
            ? accordionSummaryRef.current?.clientHeight
            : "100%",
        }}
      >
        {showChangeButton && (
          <Link
            component="button"
            onClick={(event) => {
              event.stopPropagation();
              handleChangeAnswer(id);
            }}
          >
            Change
            <span style={visuallyHidden}>
              your response to {question.data.text || "this question"}
            </span>
          </Link>
        )}
      </ChangeLink>
      <AccordionFlag flagColor={flagColor} />
    </Root>
  );
};

export default ResultReason;
