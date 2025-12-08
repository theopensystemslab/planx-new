import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { PublicProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import React, { useEffect } from "react";
import InputLabel from "ui/public/InputLabel";
import { CharacterCounter } from "ui/shared/CharacterCounter";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { object } from "yup";

import { DESCRIPTION_TEXT, ERROR_MESSAGE } from "../shared/constants";
import { getPreviouslySubmittedData, makeData } from "../shared/utils";
import type { TextInput, UserData } from "./model";
import { getTextLimit, textInputValidationSchema } from "./model";

export type Props = PublicProps<TextInput> & { autoAnswer?: UserData };

// TODO: fix this data field bug for all components
const TextInputComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: {
      text: getPreviouslySubmittedData(props) ?? "",
    },
    onSubmit: (values) => {
      props.handleSubmit?.(makeData(props, values.text));
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: object({
      text: textInputValidationSchema({ data: props, required: true }),
    }),
  });

  const characterCountLimit = getTextLimit(props.type, props.customLength);
  const displayCharacterCount =
    characterCountLimit > 120 &&
    characterCountLimit <= 1500 &&
    props.type !== "email";

  // Auto-answered TextInputs still set a breadcrumb even though they render null
  useEffect(() => {
    if (props.autoAnswer) {
      props.handleSubmit?.({
        ...makeData(props, props.autoAnswer),
        auto: true,
      });
    }
  }, [props.autoAnswer, props.handleSubmit]);

  // Auto-answered TextInputs are not publicly visible
  if (props.autoAnswer) {
    return null;
  }

  return (
    <Card handleSubmit={formik.handleSubmit} isValid>
      <CardHeader
        title={props.title}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <InputRow>
        <InputLabel label={props.title} hidden htmlFor={props.id}>
          <Input
            autoComplete={((type) => {
              if (type === "email") return "email";
              else if (type === "phone") return "tel";
              return "off";
            })(props.type)}
            type={((type) => {
              if (type === "email") return "email";
              else if (type === "phone") return "tel";
              return "text";
            })(props.type)}
            multiline={characterCountLimit > 120 && props.type !== "email"}
            rows={
              characterCountLimit > 120 && props.type !== "email"
                ? 5
                : undefined
            }
            name="text"
            value={formik.values.text}
            bordered
            onChange={formik.handleChange}
            errorMessage={formik.errors.text as string}
            id={props.id}
            inputProps={{
              "aria-describedby": [
                props.description ? DESCRIPTION_TEXT : "",
                displayCharacterCount ? "character-hint" : "",
                formik.errors.text ? `${ERROR_MESSAGE}-${props.id}` : "",
              ]
                .filter(Boolean)
                .join(" "),
            }}
          />
          {displayCharacterCount && (
            <CharacterCounter
              limit={characterCountLimit}
              count={formik.values.text.length}
              error={Boolean(formik.errors.text)}
            />
          )}
        </InputLabel>
      </InputRow>
    </Card>
  );
};

export default TextInputComponent;
