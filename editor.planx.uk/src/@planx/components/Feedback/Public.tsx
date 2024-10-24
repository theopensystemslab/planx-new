import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@planx/components/shared/Preview/Card";
import CardHeader from "@planx/components/shared/Preview/CardHeader";
import type { PublicProps } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import RichTextInput from "ui/editor/RichTextInput";
import TerribleFace from "ui/images/feedback_filled-01.svg";
import PoorFace from "ui/images/feedback_filled-02.svg";
import NeutralFace from "ui/images/feedback_filled-03.svg";
import GoodFace from "ui/images/feedback_filled-04.svg";
import ExcellentFace from "ui/images/feedback_filled-05.svg";
import InputLabel from "ui/public/InputLabel";

import { getPreviouslySubmittedData, makeData } from "../shared/utils";
import { FaceBox } from "./components/FaceBox";
import { StyledToggleButtonGroup } from "./styled";
import { FeedbackComponentProps, FormProps } from "./types";

const FeedbackComponent = (
  props: PublicProps<FeedbackComponentProps>,
): FCReturn => {
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
      <CardHeader title={props.title} description={props.description} />
      <Box pt={2}>
        <InputLabel label="How would you rate your experience with this service?">
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
        </InputLabel>
        <InputLabel label="Please tell us more about your experience">
          <RichTextInput
            name="feedback"
            value={formik.values.feedback}
            onChange={formik.handleChange}
          />
        </InputLabel>
      </Box>
    </Card>
  );
};

export default FeedbackComponent;
