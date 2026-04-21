import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  DESCRIPTION_TEXT,
  ERROR_MESSAGE,
} from "@planx/components/shared/constants";
import type { PublicProps } from "@planx/components/shared/types";
import { TEXT_LIMITS, TextInputType } from "@planx/components/TextInput/model";
import { useFormikContext } from "formik";
import React from "react";
import InputLabel from "ui/public/InputLabel";
import { CharacterCounter } from "ui/shared/CharacterCounter";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import type { EnhancedTextInput } from "../types";
import type { FormValues } from "./types";

const ModifyUserInput: React.FC<PublicProps<EnhancedTextInput>> = (props) => {
  const { values, errors, setFieldValue } = useFormikContext<FormValues>();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue("userInput", event.target.value);
  };

  const showError = Boolean(errors.userInput);

  return (
    <Box mb={2}>
      <Typography variant="h2" component="h1" mb={1}>
        Confirm your project description
      </Typography>
      <Typography variant="subtitle1" component="p" mb={2}>
        Edit the description below, or continue to submit it as shown.
      </Typography>
      <InputRow>
        <InputLabel label="Project description" htmlFor={props.id} hidden>
          <Input
            type="text"
            multiline
            rows={5}
            name="userInput"
            value={values.userInput}
            bordered
            onChange={handleChange}
            errorMessage={showError ? (errors.userInput as string) : undefined}
            id={props.id}
            inputProps={{
              "aria-describedby": [
                props.description ? DESCRIPTION_TEXT : "",
                "character-hint",
                showError ? `${ERROR_MESSAGE}-${props.id}` : "",
              ]
                .filter(Boolean)
                .join(" "),
            }}
          />
          <CharacterCounter
            limit={TEXT_LIMITS[TextInputType.Long]}
            count={values.userInput.length}
            error={showError}
          />
        </InputLabel>
      </InputRow>
    </Box>
  );
};

export default ModifyUserInput;
