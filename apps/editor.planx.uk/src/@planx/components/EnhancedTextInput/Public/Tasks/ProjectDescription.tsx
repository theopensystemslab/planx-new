import HelpIcon from "@mui/icons-material/Help";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import {
  DESCRIPTION_TEXT,
  ERROR_MESSAGE,
} from "@planx/components/shared/constants";
import { HelpButton } from "@planx/components/shared/Preview/CardHeader/styled";
import MoreInfo from "@planx/components/shared/Preview/MoreInfo";
import MoreInfoSection from "@planx/components/shared/Preview/MoreInfoSection";
import type { PublicProps } from "@planx/components/shared/types";
import { TEXT_LIMITS, TextInputType } from "@planx/components/TextInput/model";
import { useQuery } from "@tanstack/react-query";
import { useFormikContext} from "formik";
import { enhanceProjectDescription } from "lib/api/ai/requests";
import type { EnhanceError, EnhanceResponse } from "lib/api/ai/types";
import type { APIError } from "lib/api/client";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useRef, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { ApplicationPath } from "types";
import CheckCircleIcon from "ui/icons/CheckCircle";
import InputLabel from "ui/public/InputLabel";
import { CharacterCounter } from "ui/shared/CharacterCounter";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { HOW_DOES_THIS_WORK } from "../../content";
import type { EnhancedTextInputForTask } from "../../types";
import type { FormValues } from "../types";
import ErrorCard from "./ErrorCard";
import LoadingSkeleton from "./LoadingSkeleton";

type Props = PublicProps<EnhancedTextInputForTask<"projectDescription">>;

const Card = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  flexBasis: "100%",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  [`theme.breakpoints.up('contentWrap')`]: {
    flexBasis: "50%",
  },
}));

const ProjectDescription: React.FC<Props> = (props) => {
  const [flowId, sessionId, path] = useStore((state) => [
    state.id,
    state.sessionId,
    state.path,
  ]);

  const { values, handleChange, errors, setFieldValue, setValues } =
    useFormikContext<FormValues>();
  const [open, setOpen] = useState(false);

  const initialValueRef = useRef(values.userInput);
  const [shouldEnhance, setShouldEnhance] = React.useState(true);

  const { isPending, data, error, isSuccess } = useQuery<
    EnhanceResponse,
    APIError<EnhanceError>
  >({
    queryFn: () =>
      enhanceProjectDescription({
        original: initialValueRef.current,
        sessionId:
          path === ApplicationPath.SaveAndReturn ? sessionId : undefined,
        flowId,
      }),
    queryKey: [
      "projectDescription",
      flowId,
      path,
      sessionId,
      initialValueRef.current,
    ], // Use initial value, not changing value
    retry: 0,
    enabled: shouldEnhance && !!initialValueRef.current,
  });

  // Populate text field with "enhanced" value
  useEffect(() => {
    if (isSuccess && data) {
      setValues({
        userInput: data.enhanced,
        status: "success",
        original: data.original,
        enhanced: data.enhanced,
        error: null,
      });
      setShouldEnhance(false);
    }
  }, [isSuccess, data, setValues]);

  useEffect(() => {
    if (error) {
      setValues({
        status: "error",
        original: initialValueRef.current,
        enhanced: null,
        error: error.data.error,
        userInput: initialValueRef.current,
      });
    }
  }, [error, setValues]);

  if (isPending) return <LoadingSkeleton />;

  if (error) {
    switch (error.data.error) {
      case "INVALID_INPUT":
        return (
          <ErrorCard
            title="Invalid description"
            description="We weren't able to generate a description based on your input. The description doesn't appear to be related to a planning application."
          />
        );

      case "TOO_MANY_REQUESTS":
        return (
          <ErrorCard
            title="Rate limit exceeded"
            description="You've sent too many requests to our AI service. We'll use your original project description."
          />
        );

      default:
        return (
          <ErrorCard
            title="Service unavailable"
            description="Unable to generate enhanced project description. We'll use your original project description."
          />
        );
    }
  }

  return (
    <>
      <Box my={2}>
        <Typography
          variant="h3"
          component="h2"
          fontWeight={FONT_WEIGHT_SEMI_BOLD}
          mb={1}
        >
          {props.revisionTitle}
        </Typography>
        <Typography variant="body2">{props.revisionDescription}</Typography>
        <Typography variant="subtitle1" component="div">
          <HelpButton
            variant="help"
            title="How does this work?"
            aria-label={"See more information about how this feature works"}
            onClick={() => setOpen(true)}
            aria-haspopup="dialog"
            data-testid="more-info-button"
          >
            <HelpIcon />
            How does this work?
          </HelpButton>
        </Typography>
      </Box>

      {data && (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", contentWrap: "row" },
            maxWidth: "100%",
          }}
          gap={2}
          mb={2}
        >
          <Card>
            <Typography variant="h4" component="h3">
              Your description:
            </Typography>
            <Typography variant="body2">{data.original}</Typography>
            <Button
              variant="outlined"
              color="primary"
              sx={{ mt: "auto" }}
              onClick={() => setFieldValue("userInput", data.original)}
              disabled={values.userInput === data.original}
              startIcon={
                values.userInput === data.original ? (
                  <CheckCircleIcon color="success" />
                ) : null
              }
            >
              Revert to original description
            </Button>
          </Card>
          <Card>
            <Typography variant="h3" component="h3">
              Suggested description:
            </Typography>
            <Typography variant="body2">{data.enhanced}</Typography>
            <Button
              variant="outlined"
              color="primary"
              sx={{ mt: "auto" }}
              onClick={() => setFieldValue("userInput", data.enhanced)}
              disabled={values.userInput === data.enhanced}
              startIcon={
                values.userInput === data.enhanced ? (
                  <CheckCircleIcon color="success" />
                ) : null
              }
            >
              Continue with suggested description
            </Button>
          </Card>
        </Box>
      )}

      <InputRow>
        <InputLabel label={props.title} hidden htmlFor={props.id}>
          <Input
            type="text"
            multiline
            rows={5}
            name="userInput"
            value={values.userInput}
            bordered
            onChange={handleChange}
            errorMessage={errors.userInput as string}
            id={props.id}
            inputProps={{
              "aria-describedby": [
                props.description ? DESCRIPTION_TEXT : "",
                "character-hint",
                errors.userInput ? `${ERROR_MESSAGE}-${props.id}` : "",
              ]
                .filter(Boolean)
                .join(" "),
            }}
          />
          <CharacterCounter
            limit={TEXT_LIMITS[TextInputType.Long]}
            count={values.userInput?.length || 0}
            error={Boolean(errors.userInput)}
          />
        </InputLabel>
      </InputRow>
      <MoreInfo open={open} handleClose={() => setOpen(false)}>
        <MoreInfoSection title="How does this work?">
          <ReactMarkdownOrHtml source={HOW_DOES_THIS_WORK} openLinksOnNewTab />
        </MoreInfoSection>
      </MoreInfo>
    </>
  );
};

export default ProjectDescription;
