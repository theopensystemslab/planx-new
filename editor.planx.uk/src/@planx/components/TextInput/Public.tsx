import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import { object } from "yup";

import type { TextInput, UserData } from "./model";
import { userDataSchema } from "./model";

export type Props = PublicProps<TextInput, UserData>;

const TextInputComponent: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: {
      text: "",
    },
    onSubmit: (values) => {
      const data = props.fn ? { [props.fn]: values } : undefined;
      props.handleSubmit?.(undefined, data);
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
          type={props.type === "email" ? "email" : "text"}
          multiline={props.type === "long"}
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
