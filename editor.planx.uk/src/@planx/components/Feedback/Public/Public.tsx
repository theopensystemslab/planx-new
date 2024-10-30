import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import type { PublicProps } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import TerribleFace from "ui/images/feedback_filled-01.svg";
import PoorFace from "ui/images/feedback_filled-02.svg";
import NeutralFace from "ui/images/feedback_filled-03.svg";
import GoodFace from "ui/images/feedback_filled-04.svg";
import ExcellentFace from "ui/images/feedback_filled-05.svg";
import InputLabel from "ui/public/InputLabel";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { getPreviouslySubmittedData, makeData } from "../../shared/utils";
import { FaceBox } from "../components/FaceBox";
import { Feedback, FormProps } from "../model";
import { StyledToggleButtonGroup } from "../styled";

const FeedbackComponent = (props: PublicProps<Feedback>): FCReturn => {
  const formik = useFormik<FormProps>({
    initialValues: getPreviouslySubmittedData(props) ?? {
      feedbackScore: "",
      feedback: "",
    },
    onSubmit: (values) => {
      props.handleSubmit?.(makeData(props, values));
    },
  });

  const handleFeedbackChange = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string | null,
  ) => {
    if (newValue !== null) {
      formik.setFieldValue("feedbackScore", newValue);
    }
  };

  return (
    <Card handleSubmit={formik.handleSubmit}>
      <CardHeader title={props.title} />
      <ReactMarkdownOrHtml
        source={props.description}
        id={"DESCRIPTION_TEXT"}
        openLinksOnNewTab
      />
      <Box pt={2} mb={3}>
        {props.ratingQuestion && (
          <InputLabel
            label={
              <ReactMarkdownOrHtml
                source={props.ratingQuestion}
                id={"RATING_QUESTION"}
                openLinksOnNewTab
              />
            }
          />
        )}
        <StyledToggleButtonGroup
          value={formik.values.feedbackScore}
          exclusive
          id="feedbackButtonGroup"
          onChange={handleFeedbackChange}
          aria-label="feedback score"
        >
          <Grid container columnSpacing={15} component="fieldset">
            <FaceBox
              value="1"
              testId="feedback-button-terrible"
              icon={TerribleFace}
              label="Terrible"
              altText="very unhappy face"
            />
            <FaceBox
              value="2"
              icon={PoorFace}
              label="Poor"
              altText="slightly unhappy face"
            />
            <FaceBox
              value="3"
              icon={NeutralFace}
              label="Neutral"
              altText="neutral face"
            />
            <FaceBox
              value="4"
              icon={GoodFace}
              label="Good"
              altText="smiling face"
            />
            <FaceBox
              value="5"
              icon={ExcellentFace}
              label="Excellent"
              altText="very happy face"
            />
          </Grid>
        </StyledToggleButtonGroup>
        {props.freeformQuestion && (
          <InputLabel
            label={
              <ReactMarkdownOrHtml
                source={props.freeformQuestion}
                id={"RATING_QUESTION"}
                openLinksOnNewTab
              />
            }
          />
        )}
        <RichTextInput
          name="feedback"
          value={formik.values.feedback}
          placeholder="What did you think?"
          onChange={formik.handleChange}
        />
      </Box>
      <Typography variant="caption">
        <ReactMarkdownOrHtml source={props?.disclaimer} id={"DISCLAIMER"} />
      </Typography>
    </Card>
  );
};

export default FeedbackComponent;
