import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import ToggleButtonGroup, {
  toggleButtonGroupClasses,
} from "@mui/material/ToggleButtonGroup";
import Card from "@planx/components/shared/Preview/Card";
import CardHeader from "@planx/components/shared/Preview/CardHeader";
import type { PublicProps } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import TerribleFace from "ui/images/feedback_filled-01.svg";
import PoorFace from "ui/images/feedback_filled-02.svg";
import NeutralFace from "ui/images/feedback_filled-03.svg";
import GoodFace from "ui/images/feedback_filled-04.svg";
import ExcellentFace from "ui/images/feedback_filled-05.svg";
import InputLabel from "ui/public/InputLabel";

// import * as Yup from "yup";
import { BaseNodeData } from "../shared";
import { getPreviouslySubmittedData, makeData } from "../shared/utils";
import { FaceBox } from "./components/FaceBox";

export interface FeedbackComponentProps extends BaseNodeData {
  title: string;
  description?: string;
  fn?: string;
}

interface FormProps {
  feedbackScore: string;
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(() => ({
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    border: 0,
  },
}));

const FeedbackComponent = (
  props: PublicProps<FeedbackComponentProps>,
): FCReturn => {
  const formik = useFormik<FormProps>({
    initialValues: getPreviouslySubmittedData(props) ?? {
      feedbackScore: "",
    },
    onSubmit: (values) => {
      props.handleSubmit?.(makeData(props, values));
    },
    // TODO: make mandatory feedback toggleable
    // validateOnBlur: false,
    // validateOnChange: false,
    // validationSchema: Yup.object().shape({
    //   feedbackButtonGroup: Yup.string().required(
    //     "A feedback option is required"
    //   ),
    // }),
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
    </Card>
  );
};

export default FeedbackComponent;
