import Accordion, { accordionClasses } from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary, {
  accordionSummaryClasses,
} from "@mui/material/AccordionSummary";
import Box, { BoxProps } from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import React, { useLayoutEffect, useRef, useState } from "react";
import Caret from "ui/icons/Caret";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

interface IResultReason {
  id: string;
  question: Store.Node;
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
  [`& > div.${accordionClasses.root}.Mui-expanded`]: {
    margin: "0",
  },
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
  [`&.${accordionClasses.root}.Mui-expanded`]: {
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
  [`&.${accordionSummaryClasses.root}.Mui-expanded`]: {
    margin: "0",
  },
  [`&.${classes.removeTopBorder}`]: {
    "&:before": {
      display: "none",
    },
  },
}));

const NonExpandingSummary = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(2, 0, 2, 3),
  borderBottom: `1px solid ${theme.palette.border.main}`,
  width: "100%",
  zIndex: 2,
}));

const ResultReason: React.FC<IResultReason> = ({
  id,
  question,
  response,
  showChangeButton = false,
  flagColor,
}) => {
  const changeAnswer = useStore((state) => state.changeAnswer);
  const summaryRef = useRef<HTMLDivElement | null>(null);
  const [summaryHeight, setSummaryHeight] = useState(0);

  // Match height of closed accordion to ChangeLink
  useLayoutEffect(() => {
    if (summaryRef.current) {
      const height = summaryRef.current.clientHeight;
      setSummaryHeight(height);
    }
  }, [summaryRef]);

  const hasMoreInfo = question.data?.info ?? question.data?.policyRef;

  const ariaLabel = `${question.data?.text}: Your answer was: ${response}. ${
    hasMoreInfo
      ? "Click to expand for more information about this question."
      : ""
  }`;

  const { trackEvent } = useAnalyticsTracking();

  const handleChangeAnswer = (id: string) => {
    trackEvent({
      event: "backwardsNavigation",
      metadata: null,
      initiator: "change",
      nodeId: id,
    });
    changeAnswer(id);
  };

  return (
    <Root>
      {hasMoreInfo ? (
        <StyledAccordion
          classes={{ root: classes.removeTopBorder }}
          elevation={0}
        >
          <StyledAccordionSummary
            expandIcon={<Caret />}
            aria-label={ariaLabel}
            aria-controls={`group-${id}-content`}
            id={`group-${id}-header`}
            ref={summaryRef}
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
                {question.data?.text} <br />
                <strong>{response}</strong>
              </Typography>
            </SummaryWrap>
          </StyledAccordionSummary>
          <AccordionDetails sx={{ py: 1, px: 0 }}>
            <MoreInfo>
              {question.data?.info && (
                <ReactMarkdownOrHtml
                  source={question.data?.info}
                  openLinksOnNewTab
                />
              )}
              {question.data?.policyRef && (
                <ReactMarkdownOrHtml
                  source={question.data?.policyRef}
                  openLinksOnNewTab
                />
              )}
            </MoreInfo>
          </AccordionDetails>
        </StyledAccordion>
      ) : (
        <NonExpandingSummary ref={summaryRef}>
          <Typography
            variant="body1"
            color="textPrimary"
            id={`questionText-${id}`}
          >
            {question.data?.text} <br />
            <strong>{response}</strong>
          </Typography>
        </NonExpandingSummary>
      )}
      <ChangeLink sx={{ height: summaryHeight }}>
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
              your response to {question.data?.text || "this question"}
            </span>
          </Link>
        )}
      </ChangeLink>
      <AccordionFlag flagColor={flagColor} />
    </Root>
  );
};

export default ResultReason;
