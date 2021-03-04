import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Warning from "@material-ui/icons/WarningOutlined";
import Card from "@planx/components/shared/Preview/Card";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import { useFormik } from "formik";
import { handleSubmit } from "pages/Preview/Node";
import React, { useState } from "react";
import type { Node, TextContent } from "types";
import Input from "ui/Input";

import ResultReason from "./ResultReason";
import ResultSummary from "./ResultSummary";

export interface Props {
  handleSubmit: handleSubmit;
  headingColor: {
    text: string;
    background: string;
  };
  headingTitle?: string;
  description?: string;
  reasonsTitle?: string;
  responses: Array<{
    question: Node;
    selections?: Array<Node>;
    hidden: boolean;
  }>;
  disclaimer?: TextContent;
}

const useClasses = makeStyles((theme) => ({
  disclaimer: {
    cursor: "pointer",
  },
  readMore: {
    marginLeft: theme.spacing(1),
    color: theme.palette.grey[500],
    "&:hover": {
      color: theme.palette.grey[400],
    },
  },
  disclaimerContent: {
    marginTop: theme.spacing(1),
  },
  feedbackButton: {
    color: theme.palette.text.primary,
  },
  submitFeedback: {
    marginTop: theme.spacing(2),
  },
}));

const Responses = ({ responses }: any) => (
  <>
    {responses.map(({ question, selections }: any) => (
      <ResultReason
        key={question.id}
        id={question.id}
        question={question}
        response={selections.map((s: any) => s.data.text).join(",")}
      />
    ))}
  </>
);

const Result: React.FC<Props> = ({
  handleSubmit,
  headingColor,
  headingTitle = "",
  description = "",
  reasonsTitle = "",
  responses,
  disclaimer,
}) => {
  const formik = useFormik({
    initialValues: {
      feedback: "",
    },
    onSubmit: (values) => {
      // TODO: move this functionality into a prop so this component can remain ui-only
      // note: this is a test feedback fish ID; responses will not go to normal
      // PlanX account
      const feedbackFishId = "b929227ff0690e";
      fetch("https://api.feedback.fish/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: feedbackFishId,
          text: values.feedback,
          category: "other",
          metadata: {
            reason: "Wrong result",
          },
        }),
      })
        .then((r) => console.log(r))
        .catch((err) => console.error(err));
    },
  });

  const visibleResponses = responses.filter((r) => !r.hidden);
  const hiddenResponses = responses.filter((r) => r.hidden);

  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  const classes = useClasses();
  const theme = useTheme();

  return (
    <Box width="100%" display="flex" flexDirection="column" alignItems="center">
      <ResultSummary
        heading={headingTitle}
        description={description}
        color={headingColor}
      />
      <Card handleSubmit={() => handleSubmit && handleSubmit([])} isValid>
        <Box mt={4} mb={3}>
          <Typography variant="h3" gutterBottom>
            {reasonsTitle}
          </Typography>
        </Box>
        <Box mb={3}>
          <Responses responses={visibleResponses} />

          {hiddenResponses.length > 0 && (
            <SimpleExpand
              buttonText={{
                open: "Show all responses",
                closed: "Hide other responses",
              }}
            >
              <Responses responses={hiddenResponses} />
            </SimpleExpand>
          )}
        </Box>
        {disclaimer?.show && (
          <Box
            bgcolor="background.paper"
            p={1.25}
            display="flex"
            color={theme.palette.grey[600]}
            className={classes.disclaimer}
          >
            <Warning />
            <Box ml={1}>
              <Box
                display="flex"
                alignItems="center"
                onClick={() =>
                  setShowDisclaimer((showDisclaimer) => !showDisclaimer)
                }
              >
                <Typography variant="h6" color="inherit">
                  {disclaimer.heading}
                </Typography>
                <Typography variant="body2" className={classes.readMore}>
                  read {showDisclaimer ? "less" : "more"}
                </Typography>
              </Box>
              <Collapse in={showDisclaimer}>
                <Typography
                  variant="body2"
                  color="inherit"
                  className={classes.disclaimerContent}
                >
                  {disclaimer.content}
                </Typography>
              </Collapse>
            </Box>
          </Box>
        )}

        <Button
          className={classes.feedbackButton}
          onClick={() =>
            setShowFeedbackForm((showFeedbackForm) => !showFeedbackForm)
          }
          disableRipple
        >
          <Typography variant="body2">
            Is this result inaccurate? <b>tell us why</b>
          </Typography>
        </Button>
        <Collapse in={true}>
          <form onSubmit={formik.handleSubmit}>
            <Box
              bgcolor="background.paper"
              p={2}
              display="flex"
              flexDirection="column"
              alignItems="flex-end"
            >
              <Input
                multiline
                bordered
                value={formik.values.feedback}
                name="feedback"
                onChange={formik.handleChange}
              />
              <Button
                className={classes.submitFeedback}
                variant="contained"
                color="primary"
                type="submit"
              >
                Submit
              </Button>
            </Box>
          </form>
        </Collapse>
      </Card>
    </Box>
  );
};
export default Result;
