import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import { object } from "yup";

import { makeData } from "../shared/utils";
import type { TextInput, UserData } from "./model";
import { userDataSchema } from "./model";

export type Props = PublicProps<TextInput, UserData>;

const TextInputComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: {
      text:
        (props.id &&
          (props.previouslySubmittedData?.data?.[props.id] as string)) ??
        "",
    },
    onSubmit: (values) => {
      props.handleSubmit?.(makeData(props, values.text));
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: object({
      text: userDataSchema(props.type),
    }),
  });

  return (
    <Card handleSubmit={formik.handleSubmit} isValid>
      <QuestionHeader
        title={props.title}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <InputRow>
        <Input
          type={((type) => {
            if (type === "email") return "email";
            else if (type === "phone") return "tel";
            return "text";
          })(props.type)}
          multiline={props.type === "long"}
          rows={props.type === "long" ? 5 : undefined}
          name="text"
          value={formik.values.text}
          placeholder={props.placeholder || "Type your answer"}
          bordered
          onChange={formik.handleChange}
          errorMessage={formik.errors.text}
        />
      </InputRow>
    </Card>
  );
};

export default TextInputComponent;
