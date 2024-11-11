import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Disclaimer } from "@planx/components/shared/Disclaimer";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import type { PublicProps } from "@planx/components/shared/types";
import { FeedbackView } from "components/Feedback/types";
import { useFormik } from "formik";
import {
  getInternalFeedbackMetadata,
  insertFeedbackMutation,
} from "lib/feedback";
import React from "react";
import TerribleFace from "ui/images/feedback_filled-01.svg";
import PoorFace from "ui/images/feedback_filled-02.svg";
import NeutralFace from "ui/images/feedback_filled-03.svg";
import GoodFace from "ui/images/feedback_filled-04.svg";
import ExcellentFace from "ui/images/feedback_filled-05.svg";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { getPreviouslySubmittedData, makeData } from "../../shared/utils";
import { FaceBox } from "../components/FaceBox";
import { Feedback, FormProps } from "../model";
import { StyledToggleButtonGroup } from "../styled";

export const PASSPORT_FEEDBACK_KEY = "_feedback";

const FeedbackComponent = (props: PublicProps<Feedback>): FCReturn => {
  const handleSubmitFeedback = async (values: FormProps) => {
    const metadata = await getInternalFeedbackMetadata();
    const data = {
      ...metadata,
      ...values,
      feedbackType: "component" as FeedbackView,
    };
    const submitFeedbackResult = await insertFeedbackMutation(data).catch(
      (err) => {
        console.error(err);
      },
    );
    props.handleSubmit?.(makeData(props, values, PASSPORT_FEEDBACK_KEY));
    if (!submitFeedbackResult) {
      return;
    }
  };

  const formik = useFormik<FormProps>({
    initialValues: getPreviouslySubmittedData(props) ?? {
      feedbackScore: "",
      userComment: "",
    },
    onSubmit: handleSubmitFeedback,
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
      <CardHeader
        title={props.title}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <ReactMarkdownOrHtml
        source={props.description}
        id={"DESCRIPTION_TEXT"}
        openLinksOnNewTab
      />
      <Box my={4}>
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
          <Grid
            container
            columnSpacing={2}
            component="fieldset"
            direction={{ xs: "column", formWrap: "row" }}
          >
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
        <Input
          multiline={true}
          rows={3}
          name="userComment"
          value={formik.values.userComment}
          bordered
          onChange={formik.handleChange}
          aria-label="user comment"
        />
      </Box>
      {props.disclaimer && <Disclaimer text={props.disclaimer} />}
    </Card>
  );
};

export default FeedbackComponent;
