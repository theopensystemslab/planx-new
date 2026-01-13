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

const InitialUserInput: React.FC<PublicProps<EnhancedTextInput>> = (props) => {
  const { values, handleChange, errors } = useFormikContext<{
    userInput: string;
  }>();

  return (
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
  );
};

export default InitialUserInput;
