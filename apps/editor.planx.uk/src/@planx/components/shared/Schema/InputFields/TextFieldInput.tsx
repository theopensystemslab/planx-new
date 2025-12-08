import type { TextField } from "@planx/components/shared/Schema/model";
import { getTextLimit, TextInputType } from "@planx/components/TextInput/model";
import React from "react";
import InputLabel from "ui/public/InputLabel";
import { CharacterCounter } from "ui/shared/CharacterCounter";
import Input from "ui/shared/Input/Input";

import { DESCRIPTION_TEXT, ERROR_MESSAGE } from "../../constants";
import { getFieldProps, Props } from ".";
import { FieldInputDescription } from "./shared";

export const TextFieldInput: React.FC<Props<TextField>> = (props) => {
  const fieldProps = getFieldProps(props);
  const { data, formik } = props;
  const { id, errorMessage, required, title } = fieldProps;

  const characterCountLimit =
    data.type &&
    getTextLimit(
      data.type,
      "customLength" in data ? data.customLength : undefined,
    );

  const displayCharacterCount = Boolean(
    characterCountLimit &&
    characterCountLimit > 120 &&
    characterCountLimit <= 1500 &&
    data.type !== TextInputType.Email,
  );

  return (
    <InputLabel label={title} htmlFor={id}>
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
        multiline={Boolean(
          characterCountLimit &&
          characterCountLimit > 120 &&
          data.type !== TextInputType.Email,
        )}
        bordered
        rows={
          characterCountLimit &&
          characterCountLimit > 120 &&
          data.type !== TextInputType.Email
            ? 5
            : undefined
        }
        required={required}
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
      {displayCharacterCount && (
        <CharacterCounter
          limit={characterCountLimit ?? 0}
          count={fieldProps?.value?.length}
          error={Boolean(fieldProps.errorMessage)}
        />
      )}
    </InputLabel>
  );
};
