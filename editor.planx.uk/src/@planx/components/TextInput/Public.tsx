import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import { useFormik } from "formik";
// import Input from "ui/Input";
import { Input, InputField } from "govuk-react";
import React from "react";
import InputRow from "ui/InputRow";
import { object } from "yup";

import { getPreviouslySubmittedData, makeData } from "../shared/utils";
import type { TextInput, UserData } from "./model";
import { userDataSchema } from "./model";

export type Props = PublicProps<TextInput, UserData>;

import { useEffect } from "react";
import { createGlobalStyle } from "styled-components";
import styled from "styled-components";

// Would probably need to do something like this at the layout level, similar to the global Material-UI theme
const GlobalStyle = createGlobalStyle`
  font-family: "Inter";
`;

// Adding styles to existing components is pretty straightforward
const StyledInput = styled(InputField)`
  margin-bottom: 20px;
`;

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

  useEffect(() => {
    console.log(formik.errors);
  });

  return (
    <>
      <GlobalStyle />

      <Card handleSubmit={formik.handleSubmit} isValid>
        <QuestionHeader
          title={props.title}
          description={props.description}
          info={props.info}
          policyRef={props.policyRef}
          howMeasured={props.howMeasured}
        />
        <InputRow>
          <StyledInput
            hint={<b>Hint something</b>}
            input={{
              name: "text",
              value: formik.values.text,
              placeholder: props.placeholder || "Type your answer",
              onChange: formik.handleChange,

              // Another option for trickier styles (e.g. the Input component inside InputField)
              style: { fontFamily: "Inter" },
            }}
            meta={{
              error: formik.errors.text as string,
              touched: !!formik.errors.text,
            }}
          >
            Extra context or description goes here
          </StyledInput>
        </InputRow>
      </Card>
    </>
  );
};

export default TextInputComponent;
