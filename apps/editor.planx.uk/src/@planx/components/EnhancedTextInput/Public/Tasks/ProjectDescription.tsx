import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DESCRIPTION_TEXT, ERROR_MESSAGE } from "@planx/components/shared/constants";
import type { PublicProps } from "@planx/components/shared/types";
import { TEXT_LIMITS, TextInputType } from "@planx/components/TextInput/model";
import { useQuery } from "@tanstack/react-query";
import { useFormikContext } from "formik";
import { enhanceProjectDescription } from "lib/api/ai/requests";
import type { EnhanceError, EnhanceResponse } from "lib/api/ai/types";
import type { APIError } from "lib/api/client";
import React, { useEffect } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import InputLabel from "ui/public/InputLabel";
import { CharacterCounter } from "ui/shared/CharacterCounter";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import type { EnhancedTextInputForTask } from "../../types";

type Props = PublicProps<EnhancedTextInputForTask<"projectDescription">>

const ProjectDescription: React.FC<Props> = (props) => {
  const { values, handleChange, errors, setFieldValue } = useFormikContext<{ userInput: string }>()

  const { isPending, data, error, isSuccess } = useQuery<EnhanceResponse, APIError<EnhanceError>>({
    queryFn: () => enhanceProjectDescription(values.userInput),
    queryKey: ["projectDescription", values.userInput],
    retry: 0,
    enabled: !!values.userInput,
  });

  // Populate text field with "enhanced" value
  useEffect(() => {
    if (isSuccess) setFieldValue("userInput", data.enhanced);
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
        <Typography variant="h3" fontWeight={FONT_WEIGHT_SEMI_BOLD} mb={1}>{props.revisionTitle}</Typography>
        <Typography variant="body2">{props.revisionDescription}</Typography>
      </Box>
      Original: {data.original}
      Enhanced: {data.enhanced}
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
    </>
  )
};

export default ProjectDescription;