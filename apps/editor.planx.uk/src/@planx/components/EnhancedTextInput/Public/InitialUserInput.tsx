import { DESCRIPTION_TEXT, ERROR_MESSAGE } from "@planx/components/shared/constants";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import type { PublicProps } from "@planx/components/shared/types";
import { TEXT_LIMITS, TextInputType, textInputValidationSchema } from "@planx/components/TextInput/model";
import { Formik } from "formik";
import React, { type Dispatch, type SetStateAction } from "react";
import InputLabel from "ui/public/InputLabel";
import { CharacterCounter } from "ui/shared/CharacterCounter";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { object } from "yup";

import type { EnhancedTextInput } from "../types";

type Props = PublicProps<EnhancedTextInput> & {
  onSubmit: Dispatch<SetStateAction<string>>
  initialValue: string;
};

const InitialUserInput: React.FC<Props> = (props) => {
  const validationSchema = object({
    original: textInputValidationSchema({
      data:
        { ...props, type: TextInputType.Long },
      required: true,
    })
  });

  return (
    <Formik<{ original: string }>
      initialValues={{ original: props.initialValue }}
      onSubmit={({ original }) => props.onSubmit(original)}
      enableReinitialize
      validateOnBlur={false}
      validateOnChange={false}
      validationSchema={validationSchema}
    >
      {({ values, handleChange, errors, handleSubmit }) => (
        <Card handleSubmit={handleSubmit}>
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
                type="text"
                multiline
                rows={5}
                name="original"
                value={values.original}
                bordered
                onChange={handleChange}
                errorMessage={errors.original as string}
                id={props.id}
                inputProps={{
                  "aria-describedby": [
                    props.description ? DESCRIPTION_TEXT : "",
                    "character-hint",
                    errors.original ? `${ERROR_MESSAGE}-${props.id}` : "",
                  ]
                    .filter(Boolean)
                    .join(" "),
                }}
              />
              <CharacterCounter
                limit={TEXT_LIMITS[TextInputType.Long]}
                count={values.original.length}
                error={Boolean(errors.original)}
              />
            </InputLabel>
          </InputRow>
        </Card>
      )}
    </Formik>
  )
}

export default InitialUserInput;