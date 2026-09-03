import HelpIcon from "@mui/icons-material/Help";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import RadioGroup, { useRadioGroup } from "@mui/material/RadioGroup";
import Typography from "@mui/material/Typography";
import { HelpButton } from "@planx/components/shared/Preview/CardHeader/styled";
import MoreInfo from "@planx/components/shared/Preview/MoreInfo";
import MoreInfoSection from "@planx/components/shared/Preview/MoreInfoSection";
import { useQuery } from "@tanstack/react-query";
import { useFormikContext } from "formik";
import { enhanceProjectDescription } from "lib/api/ai/requests";
import type { EnhanceError, EnhanceResponse } from "lib/api/ai/types";
import type { APIError } from "lib/api/client";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { type ComponentProps, useEffect, useRef, useState } from "react";
import { ApplicationPath } from "types";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import ProgressiveLoading from "ui/shared/ProgressiveLoading";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { HOW_DOES_THIS_WORK } from "../../content";
import type { TaskAction } from "../../types";
import type { TaskComponentMap } from "../../types";
import type { FormValues } from "../types";
import ErrorCard from "./ErrorCard";
import {
  QuoteDescription,
  QuotedText,
  RecommendedTag,
  StyledFormLabel,
} from "./styles";

type Props = ComponentProps<
  NonNullable<TaskComponentMap["projectDescription"]>
>;

interface DescriptionRadioProps {
  id: string;
  title: string;
  description?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  recommended?: boolean;
}

const DescriptionRadio: React.FC<DescriptionRadioProps> = ({
  id,
  title,
  description,
  onChange,
  recommended = false,
}) => {
  const radioGroupState = useRadioGroup();
  const isSelected = radioGroupState?.value === id;
  const recommendedTagId = `${id}-recommended`;
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  // Accessible name: "Recommended" (when present) then the visible choice
  const labelledBy = [recommended ? recommendedTagId : "", titleId]
    .filter(Boolean)
    .join(" ");

  const describedBy = description ? descriptionId : undefined;

  return (
    <Box sx={{ position: "relative" }}>
      {recommended && (
        <RecommendedTag id={recommendedTagId}>Recommended</RecommendedTag>
      )}
      <StyledFormLabel
        htmlFor={id}
        focused={false}
        isSelected={isSelected}
        showBorder={recommended}
      >
        <Radio
          id={id}
          value={id}
          onChange={onChange}
          slotProps={{
            input: {
              "aria-labelledby": labelledBy,
              "aria-describedby": describedBy,
            },
          }}
        />
        <Box sx={{ position: "relative" }}>
          <Typography
            id={titleId}
            variant="body1"
            sx={{
              color: "text.primary",
              pt: 0.95,
            }}
          >
            {title}
          </Typography>
          {description && (
            <QuoteDescription
              id={descriptionId}
              // Excluded as referenced by the radio's aria-describedby
              aria-hidden="true"
              variant="subtitle1"
              component="blockquote"
            >
              {description}
            </QuoteDescription>
          )}
        </Box>
      </StyledFormLabel>
    </Box>
  );
};

const ProjectDescription: React.FC<Props> = (props) => {
  const [flowId, sessionId, path] = useStore((state) => [
    state.id,
    state.sessionId,
    state.path,
  ]);
  const { values, errors, setFieldValue, setValues } =
    useFormikContext<FormValues>();
  const [open, setOpen] = useState(false);

  const initialValueRef = useRef(props.queryInput);

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
    ],
    retry: 0,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (isSuccess && data) {
      setValues({
        userInput: "",
        status: "success",
        original: data.original,
        enhanced: data.enhanced,
        error: null,
        selectedOption: null,
      });
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
        selectedOption: null,
      });
    }
  }, [error, setValues]);

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const option = event.target.value as TaskAction;
    setFieldValue("selectedOption", option);

    if (data) {
      switch (option) {
        case "acceptedEnhanced":
          setFieldValue("userInput", data.enhanced);
          break;
        case "retainedOriginal":
          setFieldValue("userInput", data.original);
          break;
        case "new":
          setFieldValue("userInput", "");
          break;
      }
    }
  };

  const showRadioError = !values.selectedOption && Boolean(errors.userInput);

  const LOADING_STAGES = [
    "Analysing your project description",
    "Reviewing structure and tone",
    "Generating suggested improvements",
  ];

  if (isPending) return <ProgressiveLoading stages={LOADING_STAGES} />;

  if (error) {
    switch (error.data.error) {
      case "INVALID_INPUT":
        return (
          <ErrorCard
            title="This doesn't look like a planning project description"
            description={[
              "Your text does not clearly describe a proposed development.",
              "You can go back to revise your description. If you continue, your project description will be submitted as entered:",
            ]}
          >
            <QuotedText variant="subtitle1">
              {initialValueRef.current}
            </QuotedText>
          </ErrorCard>
        );

      case "TOO_MANY_REQUESTS":
        return (
          <ErrorCard
            title="Rate limit exceeded"
            description="You've sent too many requests to our AI service. We'll use your original project description:"
          >
            <QuotedText variant="subtitle1">
              {initialValueRef.current}
            </QuotedText>
          </ErrorCard>
        );

      default:
        return (
          <ErrorCard
            title="Service unavailable"
            description="We were unable to generate an enhanced project description. We'll use your original project description:"
          >
            <QuotedText variant="subtitle1">
              {initialValueRef.current}
            </QuotedText>
          </ErrorCard>
        );
    }
  }

  return (
    <>
      <Box sx={{ my: 2 }}>
        <Typography variant="h2" component="h1">
          {props.revisionTitle}
        </Typography>
        <Typography variant="subtitle1" component="div">
          <ReactMarkdownOrHtml source={props.revisionDescription} />
        </Typography>
        <Typography variant="subtitle1" component="div">
          <HelpButton
            variant="help"
            title="How does this work?"
            aria-label="See more information about how this feature works"
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
        <Box sx={{ mb: 2 }}>
          <ErrorWrapper error={showRadioError ? "Select an option" : undefined}>
            <RadioGroup
              value={values.selectedOption ?? ""}
              onChange={handleOptionChange}
              aria-label="Choose project description"
            >
              <DescriptionRadio
                id="acceptedEnhanced"
                onChange={handleOptionChange}
                title="Use suggested description"
                description={data.enhanced}
                recommended
              />
              <DescriptionRadio
                id="retainedOriginal"
                onChange={handleOptionChange}
                title="Use your original description"
                description={data.original}
              />
              <Box sx={{ width: 68, my: 1 }}>
                <Typography align="center">or</Typography>
              </Box>
              <DescriptionRadio
                id="new"
                onChange={handleOptionChange}
                title="Write a new description"
              />
            </RadioGroup>
          </ErrorWrapper>
        </Box>
      )}

      <MoreInfo open={open} handleClose={() => setOpen(false)}>
        <MoreInfoSection title="How does this work?">
          <ReactMarkdownOrHtml source={HOW_DOES_THIS_WORK} openLinksOnNewTab />
        </MoreInfoSection>
      </MoreInfo>
    </>
  );
};

export default ProjectDescription;
