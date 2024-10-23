// @ts-ignore
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup, {
  toggleButtonGroupClasses,
} from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import Card from "@planx/components/shared/Preview/Card";
import CardHeader from "@planx/components/shared/Preview/CardHeader";
import type { PublicProps } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import Face from "ui/images/feedback_filled-01.svg";
import InputLabel from "ui/public/InputLabel";

// import * as Yup from "yup";
import { BaseNodeData } from "../shared";
import { getPreviouslySubmittedData, makeData } from "../shared/utils";

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
          aria-label="text alignment"
        >
          <ToggleButton
            value="1"
            aria-label="left aligned"
            data-testid="feedback-button-terrible"
          >
            <Box
              sx={{
                p: 2,
                border: "2px solid grey", // TODO get correct grey
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img src={Face} width={50} alt="smiley face" />
              <Typography variant="body2" pt={0.5}>
                Terrible
              </Typography>
            </Box>
          </ToggleButton>
          <ToggleButton value="2" aria-label="centered">
            <Box
              sx={{
                p: 2,
                border: "2px solid grey", // TODO get correct grey
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img src={Face} width={50} alt="smiley face" />
              <Typography variant="body2" pt={0.5}>
                Poor
              </Typography>
            </Box>
          </ToggleButton>
          <ToggleButton value="3" aria-label="right aligned">
            <Box
              sx={{
                p: 2,
                border: "2px solid grey", // TODO get correct grey
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img src={Face} width={50} alt="smiley face" />
              <Typography variant="body2" pt={0.5}>
                Neutral
              </Typography>
            </Box>
          </ToggleButton>
          <ToggleButton value="4" aria-label="justified">
            <Box
              sx={{
                p: 2,
                border: "2px solid grey", // TODO get correct grey
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img src={Face} width={50} alt="smiley face" />
              <Typography variant="body2" pt={0.5}>
                Good
              </Typography>
            </Box>
          </ToggleButton>
          <ToggleButton value="5" aria-label="justified">
            <Box
              sx={{
                p: 2,
                border: "2px solid grey", // TODO get correct grey
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img src={Face} width={50} alt="smiley face" />
              <Typography variant="body2" pt={0.5}>
                Excellent
              </Typography>
            </Box>
          </ToggleButton>
        </StyledToggleButtonGroup>
      </InputLabel>
    </Card>
  );
};

export default FeedbackComponent;
