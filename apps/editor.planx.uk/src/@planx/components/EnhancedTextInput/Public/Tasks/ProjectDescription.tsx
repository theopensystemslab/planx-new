import HelpIcon from "@mui/icons-material/Help";
import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup, { useRadioGroup } from "@mui/material/RadioGroup";
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
import { useFormikContext } from "formik";
import { enhanceProjectDescription } from "lib/api/ai/requests";
import type { EnhanceError, EnhanceResponse } from "lib/api/ai/types";
import type { APIError } from "lib/api/client";
import React, { useEffect, useRef, useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
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
import LoadingSkeleton from "./LoadingSkeleton";

type Props = PublicProps<EnhancedTextInputForTask<"projectDescription">>;

type DescriptionOption = "suggested" | "original" | "custom";

interface StyledFormLabelProps {
  isSelected: boolean;
  showBorder: boolean;
}

const StyledFormLabel = styled(FormLabel, {
  shouldForwardProp: (prop) => prop !== "isSelected" && prop !== "showBorder",
})<StyledFormLabelProps>(({ theme, isSelected, showBorder }) => ({
  display: "flex",
  cursor: "pointer",
  border: showBorder ? "2px solid" : "none",
  borderColor: isSelected
    ? theme.palette.text.primary
    : theme.palette.border.main,
  padding: showBorder ? theme.spacing(4, 1, 1.5, 1) : theme.spacing(0, 1),
  marginLeft: showBorder ? 0 : "2px",
  marginTop: showBorder ? theme.spacing(1) : 0,
  position: "relative",
  marginBottom: showBorder ? theme.spacing(2) : theme.spacing(1),
}));

const RecommendedTag = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  backgroundColor: theme.palette.secondary.dark,
  color: theme.palette.text.primary,
  padding: theme.spacing(0.25, 1.5),
  fontSize: theme.typography.body3.fontSize,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
}));

const QuoteDescription = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(2),
  color: theme.palette.text.primary,
  position: "relative",
  "&::before": {
    content: '""',
    display: "block",
    width: "4px",
    height: "100%",
    position: "absolute",
    left: "-37px",
    top: 0,
    backgroundColor: theme.palette.border.main,
  },
})) as typeof Typography;

const RevealedContent = styled(Box)(({ theme }) => ({
  borderLeft: `4px solid ${theme.palette.border.main}`,
  paddingLeft: theme.spacing(3.45),
  marginLeft: theme.spacing(3.2),
  paddingTop: theme.spacing(1),
}));

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
  const { values, errors, setFieldValue, setValues } =
    useFormikContext<FormValues>();
  const [open, setOpen] = useState(false);
  const [selectedOption, setSelectedOption] =
    useState<DescriptionOption | null>(null);
  const [customDescription, setCustomDescription] = useState("");

  const initialValueRef = useRef(values.userInput);
  const [shouldEnhance, setShouldEnhance] = React.useState(true);

  const { isPending, data, error, isSuccess } = useQuery<
    EnhanceResponse,
    APIError<EnhanceError>
  >({
    queryFn: () => enhanceProjectDescription(initialValueRef.current),
    queryKey: ["projectDescription", initialValueRef.current],
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

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const option = event.target.value as DescriptionOption;
    setSelectedOption(option);

    if (data) {
      switch (option) {
        case "suggested":
          setFieldValue("userInput", data.enhanced);
          break;
        case "original":
          setFieldValue("userInput", data.original);
          break;
        case "custom":
          setFieldValue("userInput", customDescription);
          break;
      }
    }
  };

  const handleCustomDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = event.target.value;
    setCustomDescription(value);
    setFieldValue("userInput", value);
  };

  const showRadioError = !selectedOption && Boolean(errors.userInput);
  const showCustomInputError =
    selectedOption === "custom" && Boolean(errors.userInput);

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
              value={selectedOption ?? ""}
              onChange={handleOptionChange}
              aria-label="Choose project description"
            >
              <DescriptionRadio
                id="suggested"
                onChange={handleOptionChange}
                title="Use suggested description"
                description={data.enhanced}
                recommended
              />
              <DescriptionRadio
                id="original"
                onChange={handleOptionChange}
                title="Use your original description"
                description={data.original}
              />

              <Box width={68} my={1}>
                <Typography align="center">or</Typography>
              </Box>

              <DescriptionRadio
                id="custom"
                onChange={handleOptionChange}
                title="Write a new description"
              />
            </RadioGroup>
          </ErrorWrapper>

          {selectedOption === "custom" && (
            <RevealedContent>
              <InputRow>
                <InputLabel
                  label="Enter your project description. This will not be checked for suggested improvements"
                  htmlFor={props.id}
                >
                  <Input
                    type="text"
                    multiline
                    rows={5}
                    name="userInput"
                    value={customDescription}
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
                    count={customDescription.length}
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
