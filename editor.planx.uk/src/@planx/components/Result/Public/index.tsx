import Warning from "@mui/icons-material/WarningOutlined";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Link from "@mui/material/Link";
import { styled, useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import FeedbackInput from "@planx/components/shared/FeedbackInput";
import Card from "@planx/components/shared/Preview/Card";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import { useFormik } from "formik";
import { submitFeedback } from "lib/feedback";
import { Store, useStore } from "pages/FlowEditor/lib/store";
import type { handleSubmit } from "pages/Preview/Node";
import React, { useEffect, useState } from "react";
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
  marginBottom: theme.spacing(1),
}));

const DisclaimerHeading = styled(Typography)(({ theme }) => ({
  marginRight: theme.spacing(1),
})) as typeof Typography;

const Responses = ({
  responses,
  allowChanges,
}: {
  responses: Response[];
  allowChanges: boolean;
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
            : false
        )
        .map(({ question, selections }: Response) => (
          <ResultReason
            key={question.id}
            id={question.id}
            question={question}
            showChangeButton={allowChanges && !breadcrumbs[question.id].auto}
            response={selections.map((s: any) => s.data.text).join(",")}
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
        submitFeedback(values.feedback, "Inaccurate Result", {
          responses: responses,
        });
        resetForm();
      }
      handleSubmit?.({ feedback: values.feedback });
    },
  });
  const visibleResponses = responses.filter((r) => !r.hidden);
  const hiddenResponses = responses.filter((r) => r.hidden);

  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showSubmitButton, setShowSubmitButton] = useState<boolean>(
    Boolean(handleSubmit)
  );

  const theme = useTheme();

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
          <Typography variant="h3" component="h2" gutterBottom>
            {reasonsTitle}
          </Typography>
        </Box>
        <Box mb={3}>
          <Responses responses={visibleResponses} allowChanges={allowChanges} />

          {hiddenResponses.length > 0 && (
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
          )}
        </Box>
        {disclaimer?.show && (
          <Box
            bgcolor="background.paper"
            p={1.25}
            display="flex"
            color={theme.palette.grey[600]}
          >
            <Warning titleAccess="Warning" color="primary" />
            <Box ml={1}>
              <Box display="flex" alignItems="center">
                <DisclaimerHeading
                  variant="h6"
                  component="h3"
                  color="text.primary"
                >
                  {disclaimer.heading}
                </DisclaimerHeading>
                <Link
                  component="button"
                  onClick={() =>
                    setShowDisclaimer((showDisclaimer) => !showDisclaimer)
                  }
                >
                  <Typography variant="body2">
                    Read {showDisclaimer ? "less" : "more"}
                  </Typography>
                </Link>
              </Box>
              <Collapse in={showDisclaimer}>
                <DisclaimerContent variant="body2" color="text.primary">
                  {disclaimer.content}
                </DisclaimerContent>
              </Collapse>
            </Box>
          </Box>
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
