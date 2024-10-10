import type { TextField } from "@planx/components/shared/Schema/model";
import React from "react";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input";

import { DESCRIPTION_TEXT, ERROR_MESSAGE } from "../../constants";
import { getFieldProps, Props } from ".";
import { FieldInputDescription } from "./shared";
import { CharacterCounter } from "ui/shared/CharacterCounter";
import { characterCounterSwitch } from "../../utils";

export const TextFieldInput: React.FC<Props<TextField>> = (props) => {
  const fieldProps = getFieldProps(props);
  const { data, formik } = props;
  const { id, errorMessage } = fieldProps;

  const characterCountLimit = characterCounterSwitch(data.type);
  return (
    <InputLabel id={`input-label`} label={data.title} htmlFor={id}>
      {data.description && (
        <FieldInputDescription description={data.description} />
      )}
      <Input
        {...fieldProps}
        onChange={formik.handleChange}
        type={((type) => {
          if (type === "email") return "email";
          else if (type === "phone") return "tel";
          return "text";
        })(data.type)}
        multiline={data.type && ["long", "extraLong"].includes(data.type)}
        bordered
        rows={
          data.type && ["long", "extraLong"].includes(data.type) ? 5 : undefined
        }
        required
        inputProps={{
          "aria-describedby": [
            data.description
              ? `${DESCRIPTION_TEXT} character-hint`
              : "character-hint",
            errorMessage ? `${ERROR_MESSAGE}-${id}` : "",
          ]
            .filter(Boolean)
            .join(" "),
          "aria-labelledby": `input-label`,
        }}
      />
      {characterCountLimit && (
        <CharacterCounter
          limit={characterCountLimit}
          count={fieldProps.value.length}
          error={fieldProps.errorMessage ? true : false}
        />
      )}
    </InputLabel>
  );
};
