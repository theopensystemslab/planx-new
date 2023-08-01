import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";
import InputRow from "ui/InputRow";
import { object } from "yup";

import { DESCRIPTION_TEXT, ERROR_MESSAGE } from "../shared/constants";
import { getPreviouslySubmittedData, makeData } from "../shared/utils";
import type { TextInput } from "./model";
import { userDataSchema } from "./model";

export type Props = PublicProps<TextInput>;

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
        <InputLabel label={props.title} hidden htmlFor={props.id}>
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
            bordered
            onChange={formik.handleChange}
            errorMessage={formik.errors.text as string}
            id={props.id}
            inputProps={{
              "aria-describedby": [
                props.description ? DESCRIPTION_TEXT : "",
                formik.errors.text ? `${ERROR_MESSAGE}-${props.id}` : "",
              ]
                .filter(Boolean)
                .join(" "),
            }}
          />
        </InputLabel>
      </InputRow>
    </Card>
  );
};

export default TextInputComponent;
