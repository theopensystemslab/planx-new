import HelpIcon from "@mui/icons-material/Help";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { DESCRIPTION_TEXT, ERROR_MESSAGE } from "@planx/components/shared/constants";
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
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { HOW_DOES_THIS_WORK } from "../../content";
import type { EnhancedTextInputForTask } from "../../types";

type Props = PublicProps<EnhancedTextInputForTask<"projectDescription">>

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
  const { values, handleChange, errors, setFieldValue } = useFormikContext<{ userInput: string }>()
  const [open, setOpen] = useState(false);
  
  const initialValueRef = useRef(values.userInput);
  const [shouldEnhance, setShouldEnhance] = React.useState(true);

  const { isPending, data, error, isSuccess } = useQuery<EnhanceResponse, APIError<EnhanceError>>({
    queryFn: () => enhanceProjectDescription(initialValueRef.current),
    queryKey: ["projectDescription", initialValueRef.current], // Use initial value, not changing value
    retry: 0,
    enabled: shouldEnhance && !!initialValueRef.current,
  });

  // Populate text field with "enhanced" value
  useEffect(() => {
    if (isSuccess && data) {
      setFieldValue("userInput", data.enhanced);
      setShouldEnhance(false);
    }
  }, [isSuccess, data, setFieldValue]);

  if (isPending) return (
    <p>Loading...</p>
  )

  if (error) {
    switch (error.data.error) {
      case "INVALID_DESCRIPTION":
        return (
          <p>invalid description</p>
        )

      case "SERVICE_UNAVAILABLE":
        return (
          <p>service unavailable</p>
        )
    }
  }

  return (
    <>
      <Box my={2}>
        <Typography variant="h3" component="h2" fontWeight={FONT_WEIGHT_SEMI_BOLD} mb={1}>{props.revisionTitle}</Typography>
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
            <HelpIcon />How does this work?
          </HelpButton>
        </Typography>
      </Box>
      
      {data && (
        <Box sx={{ display: "flex", flexDirection: { xs: "column", contentWrap: "row" }, maxWidth: "100%" }} gap={2} mb={2}>
          <Card>
            <Typography variant="h4">Suggested description:</Typography>
            <Typography variant="body2">{data.enhanced}</Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              sx={{ mt: "auto", backgroundColor: "common.white" }} 
              onClick={() => setFieldValue("userInput", data.enhanced)}
            >
              Use suggested description
            </Button>
          </Card>
          <Card>
            <Typography variant="h4">Your description:</Typography>
            <Typography variant="body2">{data.original}</Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              sx={{ mt: "auto", backgroundColor: "common.white" }} 
              onClick={() => setFieldValue("userInput", data.original)}
            >
              Revert to original description
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
            count={values.userInput.length}
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
  )
};

export default ProjectDescription;
