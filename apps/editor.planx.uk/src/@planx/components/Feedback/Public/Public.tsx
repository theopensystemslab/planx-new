import ErrorOutline from "@mui/icons-material/ErrorOutline";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { WarningContainer } from "@planx/components/shared/Preview/WarningContainer";
import type { PublicProps } from "@planx/components/shared/types";
import { logger } from "airbrake";
import { FeedbackView } from "components/Feedback/types";
import { useFormik } from "formik";
import { usePublicRouteContext } from "hooks/usePublicRouteContext";
import {
  getInternalFeedbackMetadata,
  insertFeedbackMutation,
} from "lib/feedback";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import TerribleFace from "ui/images/feedback_filled-01.svg";
import PoorFace from "ui/images/feedback_filled-02.svg";
import NeutralFace from "ui/images/feedback_filled-03.svg";
import GoodFace from "ui/images/feedback_filled-04.svg";
import ExcellentFace from "ui/images/feedback_filled-05.svg";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { makeData } from "../../shared/utils";
import { FaceBox } from "../components/FaceBox";
import { createFeedbackSchema, Feedback, FormProps } from "../model";
import { StyledToggleButtonGroup } from "../styled";

export const PASSPORT_FEEDBACK_KEY = "_feedback";

const FeedbackComponent = (props: PublicProps<Feedback>): FCReturn => {
  const [teamSlug, flowSlug] = useStore((state) => [
    state.teamSlug,
    state.flowSlug,
  ]);
  const feedbackDataSchema = createFeedbackSchema(props.feedbackRequired);

  const logFeedback = async (values: FormProps) => {
    const metadata = await getInternalFeedbackMetadata();
    const data = {
      ...metadata,
      ...values,
      feedbackType: "component" as FeedbackView,
    };
    try {
      await insertFeedbackMutation(data);
    } catch (error) {
      // Don't block user, but do log error and associated feedback so that we can manually resolve this and capture the feedback
      logger.notify({ error, session: values });
    }
  };

  const handleSubmitFeedback = async (values: FormProps) => {
    await logFeedback(values);
    const data = makeData(props, values, PASSPORT_FEEDBACK_KEY);
    props.handleSubmit && props.handleSubmit(data);
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
    _event: React.MouseEvent<HTMLElement>,
    newValue: string | null,
  ) => {
    if (newValue !== null) {
      formik.setFieldValue("feedbackScore", newValue);
    }
  };

  const from = usePublicRouteContext();

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
          <Box
            sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
            component="label"
            htmlFor="feedbackButtonGroup"
          >
            <ReactMarkdownOrHtml source={props.ratingQuestion} />
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
          <Box
            sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
            component="label"
            htmlFor="userComment"
          >
            <ReactMarkdownOrHtml source={props.freeformQuestion} />
          </Box>
        )}
        <Input
          multiline={true}
          rows={3}
          name="userComment"
          id="userComment"
          value={formik.values.userComment}
          bordered
          onChange={formik.handleChange}
          aria-label="user comment"
          data-testid="user-comment"
          errorMessage={formik.errors.userComment}
          sx={{ mt: 1 }}
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
          <CustomLink
            to="pages/$page"
            from={from}
            params={{ page: "privacy" }}
            color="primary"
          >
            privacy notice
          </CustomLink>
          .
        </Typography>
      </WarningContainer>
    </Card>
  );
};

export default FeedbackComponent;
