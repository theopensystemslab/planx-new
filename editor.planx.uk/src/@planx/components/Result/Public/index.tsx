import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import FeedbackInput from "@planx/components/shared/FeedbackInput";
import Card from "@planx/components/shared/Preview/Card";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import { useFormik } from "formik";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import type { handleSubmit } from "pages/Preview/Node";
import React, { useEffect, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import type { Node, TextContent } from "types";

import ResultReason from "./ResultReason";
import ResultSummary from "./ResultSummary";

export interface Props {
  allowChanges?: boolean;
  handleSubmit?: handleSubmit;
  headingColor: {
    text: string;
    background: string;
  };
  headingTitle?: string;
  description?: string;
  reasonsTitle?: string;
  responses: Array<Response>;
  disclaimer?: TextContent;
  previouslySubmittedData?: Store.userData;
}

interface Response {
  question: Node;
  selections: Array<Node>;
  hidden: boolean;
}

const DisclaimerContent = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

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
  return (
    <>
      {responses
        .filter((response) =>
          breadcrumbs[response.question.id]
            ? breadcrumbs[response.question.id].auto
              ? response.selections.some((s) => s.data?.flag)
              : true
            : false,
        )
        .map(({ question, selections }: Response) => (
          <ResultReason
            key={question.id}
            id={question.id}
            question={question}
            showChangeButton={allowChanges && !breadcrumbs[question.id].auto}
            response={selections.map((s) => s.data.text).join(",")}
            flagColor={flagColor}
          />
        ))}
    </>
  );
};

const Result: React.FC<Props> = ({
  allowChanges = false,
  handleSubmit,
  headingColor,
  headingTitle = "",
  description = "",
  reasonsTitle = "",
  responses,
  disclaimer,
  previouslySubmittedData,
}) => {
  const formik = useFormik({
    initialValues: {
      feedback: previouslySubmittedData?.feedback || "",
    },
    onSubmit: (values, { resetForm }) => {
      if (values.feedback) {
        resetForm();
      }
      handleSubmit?.({ feedback: values.feedback });
    },
  });
  const visibleResponses = responses.filter((r) => !r.hidden);
  const hiddenResponses = responses.filter((r) => r.hidden);

  const [showSubmitButton, setShowSubmitButton] = useState<boolean>(
    Boolean(handleSubmit),
  );

  useEffect(() => {
    if (handleSubmit) return;

    setShowSubmitButton(formik.values.feedback.length > 0);
  }, [formik.values.feedback]);

  return (
    <Box width="100%" display="flex" flexDirection="column" alignItems="center">
      <ResultSummary
        heading={headingTitle}
        description={description}
        color={headingColor}
      />
      <Card
        handleSubmit={showSubmitButton ? formik.handleSubmit : undefined}
        isValid
      >
        <Box mt={4} mb={3}>
          <Typography variant="h2" gutterBottom>
            {reasonsTitle}
          </Typography>
        </Box>
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
                <DisclaimerContent variant="body2" color="text.primary">
                  {disclaimer.content}
                </DisclaimerContent>
              </Box>
            </Box>
          </WarningContainer>
        )}
        <FeedbackInput
          text="Is this information inaccurate? **Tell us why.**"
          handleChange={formik.handleChange}
          value={formik.values.feedback}
        />
      </Card>
    </Box>
  );
};
export default Result;
