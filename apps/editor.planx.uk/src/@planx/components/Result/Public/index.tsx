import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { DEFAULT_FLAG_CATEGORY } from "@opensystemslab/planx-core/types";
import Card, {
  contentFlowSpacing,
} from "@planx/components/shared/Preview/Card";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import { PublicProps } from "@planx/components/shared/types";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import { useStore } from "pages/FlowEditor/lib/store";
import { Response } from "pages/FlowEditor/lib/store/preview";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { PresentationalProps, Result } from "../model";
import ResultReason from "./ResultReason";
import ResultSummary from "./ResultSummary";

const TitleWrap = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  margin: 0,
  paddingLeft: theme.spacing(1),
})) as typeof Typography;

const Responses = ({
  responses,
  allowChanges,
  flagColor,
}: {
  responses: Response[];
  allowChanges: boolean;
  flagColor?: string;
}) => {
  const breadcrumbs = useStore((state) => state.breadcrumbs);

  const hasAffectedResult = (response: Response): boolean => {
    // Remove invalid breadcrumbs
    const breadcrumb = breadcrumbs[response.question.id];
    if (!breadcrumb) return false;

    // Retain all user answered questions
    const isAnsweredByUser = breadcrumbs[response.question.id].auto !== true;
    if (isAnsweredByUser) return true;

    // Retain responses with flags which are auto answered
    const hasFlag = response.selections.some((s) => s.data?.flags);
    return hasFlag;
  };

  return (
    <>
      {responses
        .filter(hasAffectedResult)
        .map(({ question, selections }: Response) => (
          <ResultReason
            key={question.id}
            id={question.id}
            question={question}
            showChangeButton={allowChanges && !breadcrumbs[question.id].auto}
            response={selections.map((s) => s.data?.text).join(",")}
            flagColor={flagColor}
          />
        ))}
    </>
  );
};

export const Presentational: React.FC<PresentationalProps> = ({
  allowChanges = false,
  handleSubmit,
  headingColor,
  headingTitle = "",
  description = "",
  reasonsTitle = "",
  responses,
  disclaimer,
  resetButton = false,
  resetPreview,
}) => {
  const visibleResponses = responses.filter((r) => !r.hidden);
  const hiddenResponses = responses.filter((r) => r.hidden);

  const { trackEvent } = useAnalyticsTracking();

  const handleResultResetClick = () => {
    trackEvent({
      event: "flowDirectionChange",
      metadata: null,
      flowDirection: "reset",
    });
    resetPreview && resetPreview();
  };

  return (
    <Box width="100%" display="flex" flexDirection="column" alignItems="center">
      <ResultSummary
        heading={headingTitle}
        description={description}
        color={headingColor}
      />
      <Card handleSubmit={!resetButton ? () => handleSubmit?.() : undefined}>
        {visibleResponses.length > 0 && (
          <Box mt={4} mb={3}>
            <Typography variant="h2" gutterBottom>
              {reasonsTitle}
            </Typography>
            <Typography variant="h3" gutterBottom>
              These are the responses that suggest this result
            </Typography>
          </Box>
        )}
        <Box mb={3}>
          <Responses
            responses={visibleResponses}
            allowChanges={allowChanges}
            flagColor={headingColor.background}
          />
          {hiddenResponses.length > 0 && (
            <Box py={2}>
              <SimpleExpand
                id="hidden-responses"
                buttonText={{
                  open: "Show all responses",
                  closed: "Hide other responses",
                }}
              >
                <Responses
                  responses={hiddenResponses}
                  allowChanges={allowChanges}
                />
              </SimpleExpand>
            </Box>
          )}
        </Box>
        {disclaimer?.show && (
          <WarningContainer>
            <Box sx={{ flex: 1 }}>
              <TitleWrap>
                <ErrorOutline sx={{ width: 34, height: 34 }} />
                <Title variant="h3"> {disclaimer.heading}</Title>
              </TitleWrap>
              <Box mt={2}>
                <ReactMarkdownOrHtml
                  source={disclaimer.content}
                  openLinksOnNewTab
                  manuallyIncrementHeaders
                />
              </Box>
            </Box>
          </WarningContainer>
        )}
        {resetButton && (
          <Button
            variant="contained"
            size="large"
            type="submit"
            onClick={handleResultResetClick}
            sx={contentFlowSpacing}
          >
            Back to start
          </Button>
        )}
      </Card>
    </Box>
  );
};

type Props = PublicProps<Result>;

const ResultComponent: React.FC<Props> = (props) => {
  const [hasPaid, flowSettings, resultData] = useStore((state) => [
    state.hasPaid(),
    state.flowSettings,
    state.resultData,
  ]);

  const flagSet = props.flagSet || DEFAULT_FLAG_CATEGORY;
  const data = resultData(flagSet, props.overrides);

  const { flag, responses, displayText } = data[flagSet];
  const override =
    flag?.value && props.overrides ? props.overrides[flag.value] || {} : {};

  return (
    <Presentational
      {...props}
      allowChanges={!hasPaid}
      headingColor={{
        text: flag.color,
        background: flag.bgColor,
      }}
      headingTitle={displayText.heading}
      description={displayText.description}
      reasonsTitle="Reasons"
      responses={flag.value?.endsWith(".noResult") ? [] : responses}
      disclaimer={flowSettings?.elements?.legalDisclaimer}
      resetButton={!!override.resetButton}
    />
  );
};

export default ResultComponent;
