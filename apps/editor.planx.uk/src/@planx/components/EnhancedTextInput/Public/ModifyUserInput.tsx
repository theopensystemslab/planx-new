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
import { CharacterCounter } from "ui/shared/CharacterCounter";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import type { EnhancedTextInput } from "../types";
import type { FormValues } from "./types";

const HEADING_ID = "confirm-project-description-heading";
const NOT_CHECKED_HINT_ID = "confirm-project-description-not-checked-hint";

const ModifyUserInput: React.FC<PublicProps<EnhancedTextInput>> = (props) => {
  const { values, errors, setFieldValue } = useFormikContext<FormValues>();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue("userInput", event.target.value);
  };

  const showError = Boolean(errors.userInput);
  const isWritingNew = values.selectedOption === "new";

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h2" component="h1" id={HEADING_ID} sx={{ mb: 1 }}>
        {isWritingNew
          ? "Enter your new description"
          : "Confirm your project description"}
      </Typography>
      {!isWritingNew && (
        <Typography variant="subtitle1" component="p" sx={{ mb: 1 }}>
          Edit the description below, or continue to submit it as shown.
        </Typography>
      )}
      <Typography
        variant="subtitle1"
        component="p"
        id={NOT_CHECKED_HINT_ID}
        sx={{ mb: 2 }}
      >
        This will not be checked for suggested improvements.
      </Typography>
      <InputRow>
        <Box sx={{ width: "100%" }}>
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
              "aria-labelledby": HEADING_ID,
              "aria-describedby": [
                props.description ? DESCRIPTION_TEXT : "",
                NOT_CHECKED_HINT_ID,
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
        </Box>
      </InputRow>
    </Box>
  );
};

export default ModifyUserInput;
