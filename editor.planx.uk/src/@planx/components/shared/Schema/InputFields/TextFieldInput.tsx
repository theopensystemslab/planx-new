import type { TextField } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";
import React from "react";
import InputLabel from "ui/public/InputLabel";
import { CharacterCounter, isLongTextType } from "ui/shared/CharacterCounter";
import Input from "ui/shared/Input/Input";

import { DESCRIPTION_TEXT, ERROR_MESSAGE } from "../../constants";
import { getFieldProps, Props } from ".";
import { FieldInputDescription } from "./shared";

export const TextFieldInput: React.FC<Props<TextField>> = (props) => {
  const fieldProps = getFieldProps(props);
  const { data, formik } = props;
  const { id, errorMessage } = fieldProps;

  const characterCountLimit = data.type && isLongTextType(data.type);
  return (
    <InputLabel label={data.title} htmlFor={id}>
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
        }}
      />
      {characterCountLimit && (
        <CharacterCounter
          textInputType={data.type || TextInputType.Long}
          count={fieldProps.value.length}
          error={Boolean(fieldProps.errorMessage)}
        />
      )}
    </InputLabel>
  );
};
