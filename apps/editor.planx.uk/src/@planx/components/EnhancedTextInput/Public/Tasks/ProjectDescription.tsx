import HelpIcon from "@mui/icons-material/Help";
import Box from "@mui/material/Box";
import Radio from "@mui/material/Radio";
import RadioGroup, { useRadioGroup } from "@mui/material/RadioGroup";
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
import { useFormikContext } from "formik";
import { enhanceProjectDescription } from "lib/api/ai/requests";
import type { EnhanceError, EnhanceResponse } from "lib/api/ai/types";
import type { APIError } from "lib/api/client";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect, useRef, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { ApplicationPath } from "types";
import InputLabel from "ui/public/InputLabel";
import { CharacterCounter } from "ui/shared/CharacterCounter";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { HOW_DOES_THIS_WORK } from "../../content";
import type { EnhancedTextInputForTask } from "../../types";
import type { FormValues } from "../types";
import ErrorCard from "./ErrorCard";
import ProgressiveLoading from "ui/shared/ProgressiveLoading";
import type { TaskAction } from "../../types"; 

import {
  StyledFormLabel,
  RecommendedTag,
  QuoteDescription,
  RevealedContent,
} from "./styles";

type Props = PublicProps<EnhancedTextInputForTask<"projectDescription">>;

interface StyledFormLabelProps {
  isSelected: boolean;
  showBorder: boolean;
}

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

  return (
    <StyledFormLabel
      focused={false}
      isSelected={isSelected}
      showBorder={recommended}
    >
      {recommended && <RecommendedTag>Recommended</RecommendedTag>}
      <Radio value={id} onChange={onChange} />
      <Box sx={{ position: "relative" }}>
        <Typography color="text.primary" variant="body1" pt={0.95}>
          {title}
        </Typography>
        {description && (
          <QuoteDescription variant="subtitle1" component="blockquote">
            {description}
          </QuoteDescription>
        )}
      </Box>
    </StyledFormLabel>
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
    ],
    retry: 0,
    enabled: shouldEnhance && !!initialValueRef.current,
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
        customDescription: "",
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
        selectedOption: null,
        customDescription: "",
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
        case "hybrid":
          setFieldValue("userInput", values.customDescription);
          break;
      }
    }
  };

  const handleCustomDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setFieldValue("customDescription", value);
    setFieldValue("userInput", value);
  };

  const showRadioError = !values.selectedOption && Boolean(errors.userInput);
  const showCustomInputError =
    values.selectedOption === "hybrid" && Boolean(errors.userInput);

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
        <Box mb={2}>
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

              <Box width={68} my={1}>
                <Typography align="center">or</Typography>
              </Box>

              <DescriptionRadio
                id="hybrid"
                onChange={handleOptionChange}
                title="Write a new description"
              />
            </RadioGroup>
          </ErrorWrapper>

          {values.selectedOption === "hybrid" && (
            <RevealedContent>
              <InputRow>
                <InputLabel
                  label="Enter your project description. This will not be checked for suggested improvements."
                  htmlFor={props.id}
                >
                  <Input
                    type="text"
                    multiline
                    rows={5}
                    name="userInput"
                    value={values.customDescription}
                    bordered
                    onChange={handleCustomDescriptionChange}
                    errorMessage={
                      showCustomInputError
                        ? (errors.userInput as string)
                        : undefined
                    }
                    id={props.id}
                    inputProps={{
                      "aria-describedby": [
                        props.description ? DESCRIPTION_TEXT : "",
                        "character-hint",
                        showCustomInputError
                          ? `${ERROR_MESSAGE}-${props.id}`
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" "),
                    }}
                  />
                  <CharacterCounter
                    limit={TEXT_LIMITS[TextInputType.Long]}
                    count={values.customDescription.length}
                    error={showCustomInputError}
                  />
                </InputLabel>
              </InputRow>
            </RevealedContent>
          )}
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
