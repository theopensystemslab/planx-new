import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import { useFormik } from "formik";
import React, { useEffect, useRef } from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import InputRowItem from "ui/InputRowItem";
import InputRowLabel from "ui/InputRowLabel";
import { object, string } from "yup";

import type { NumberInput, UserData } from "./model";
import { parseNumber } from "./model";

export type Props = PublicProps<NumberInput, UserData>;

export default function NumberInputComponent(props: Props): FCReturn {
  const formik = useFormik({
    initialValues: {
      value: "",
    },
    onSubmit: (values) => {
      if (values.value && props.handleSubmit) {
        const parsed = parseNumber(values.value);
        if (parsed !== null) {
          props.handleSubmit(parsed);
        }
      }
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: object({
      value: string()
        .required()
        .test({
          name: "not a number",
          message: "Enter a number",
          test: (value: string | undefined) => {
            if (!value) {
              return false;
            }
            return Boolean(parseNumber(value));
          },
        }),
    }),
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    props.autoFocus && inputRef.current?.focus();
  }, [props.autoFocus]);

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
          ref={inputRef}
          bordered
          name="value"
          type="number"
          placeholder="enter value"
          value={formik.values.value}
          onChange={formik.handleChange}
          errorMessage={formik.errors.value}
        />
        {props.units && <InputRowLabel>{props.units}</InputRowLabel>}
      </InputRow>
    </Card>
  );
}
