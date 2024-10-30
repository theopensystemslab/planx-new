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
      <Typography pt={4}>
        {props.description}
        {/* This service is a work in progress, any feedback you share about your
        experience will help us to improve it.
      </Typography>
      <Typography pt={2}>
        Don't share any personal or financial information in your feedback. If
        you do we will act according to our{" "}
        <Link href={props.privacyPolicyLink ?? ""}>privacy policy</Link>. */}
      </Typography>

      <Box pt={2} mb={3}>
        <InputLabel label="How would you rate your experience with this service?" />
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
        <InputLabel label="Please tell us more about your experience">
          <RichTextInput
            name="feedback"
            value={formik.values.feedback}
            onChange={formik.handleChange}
          />
        </InputLabel>
      </Box>
      <Typography variant="caption">
        The information collected here isn't monitored by planning officers.
        Don't use it to give extra information about your project or submission.
        If you do, it cannot be used to assess your project.
      </Typography>
    </Card>
  );
};

export default FeedbackComponent;
