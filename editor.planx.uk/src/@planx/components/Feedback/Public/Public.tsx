import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import type { PublicProps } from "@planx/components/shared/types";
import { FeedbackView } from "components/Feedback/types";
import { useFormik } from "formik";
import {
  getInternalFeedbackMetadata,
  insertFeedbackMutation,
} from "lib/feedback";
import React from "react";
import { Link as ReactNaviLink } from "react-navi";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import TerribleFace from "ui/images/feedback_filled-01.svg";
import PoorFace from "ui/images/feedback_filled-02.svg";
import NeutralFace from "ui/images/feedback_filled-03.svg";
import GoodFace from "ui/images/feedback_filled-04.svg";
import ExcellentFace from "ui/images/feedback_filled-05.svg";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { makeData } from "../../shared/utils";
import { FaceBox } from "../components/FaceBox";
import { createFeedbackSchema, Feedback, FormProps } from "../model";
import { StyledToggleButtonGroup } from "../styled";

export const PASSPORT_FEEDBACK_KEY = "_feedback";

const FeedbackComponent = (props: PublicProps<Feedback>): FCReturn => {
  const feedbackDataSchema = createFeedbackSchema(props.feedbackRequired);

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
    initialValues: props.previouslySubmittedData?.data?._feedback ?? {
      feedbackScore: "",
      userComment: "",
    },
    onSubmit: handleSubmitFeedback,
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: feedbackDataSchema,
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
          <Box sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}>
            <InputLabel label={props.ratingQuestion} />
          </Box>
        )}
        <ErrorWrapper error={formik.errors.feedbackScore}>
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
                value={1}
                testId="feedback-button-terrible"
                icon={TerribleFace}
                label="Terrible"
                altText="very unhappy face"
              />
              <FaceBox
                value={2}
                icon={PoorFace}
                label="Poor"
                altText="slightly unhappy face"
              />
              <FaceBox
                value={3}
                icon={NeutralFace}
                label="Neutral"
                altText="neutral face"
              />
              <FaceBox
                value={4}
                icon={GoodFace}
                label="Good"
                altText="smiling face"
              />
              <FaceBox
                value={5}
                icon={ExcellentFace}
                label="Excellent"
                altText="very happy face"
              />
            </Grid>
          </StyledToggleButtonGroup>
        </ErrorWrapper>
        {props.freeformQuestion && (
          <Box sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}>
            <InputLabel label={props.freeformQuestion} />
          </Box>
        )}
        <Input
          multiline={true}
          rows={3}
          name="userComment"
          value={formik.values.userComment}
          bordered
          onChange={formik.handleChange}
          aria-label="user comment"
          data-testid="user-comment"
          errorMessage={formik.errors.userComment}
        />
      </Box>
      <WarningContainer>
        <ErrorOutline />
        <Typography
          variant="body2"
          component="div"
          ml={2}
          sx={{ "& p:first-of-type": { marginTop: 0 } }}
        >
          Please do not include any personal data such as your name, email or
          address. All feedback is processed according to our{" "}
          <Link
            component={ReactNaviLink}
            href="pages/privacy"
            prefetch={false}
            color="primary"
          >
            privacy notice
          </Link>
          .
        </Typography>
      </WarningContainer>
    </Card>
  );
};

export default FeedbackComponent;
