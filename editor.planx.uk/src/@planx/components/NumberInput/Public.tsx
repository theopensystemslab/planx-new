import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import { useFormik } from "formik";
import isNil from "lodash/isNil";
import React, { useEffect, useRef } from "react";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";
import InputRow from "ui/InputRow";
import InputRowLabel from "ui/InputRowLabel";
import { object, string } from "yup";

import { DESCRIPTION_TEXT, ERROR_MESSAGE } from "../shared/constants";
import { getPreviouslySubmittedData, makeData } from "../shared/utils";
import type { NumberInput } from "./model";
import { parseNumber } from "./model";

export type Props = PublicProps<NumberInput>;

export default function NumberInputComponent(props: Props): FCReturn {
  const formik = useFormik({
    initialValues: {
      value: getPreviouslySubmittedData(props) ?? "",
    },
    onSubmit: (values) => {
      if (props.handleSubmit) {
        const parsed = parseNumber(values.value);
        if (!isNil(parsed)) {
          props.handleSubmit(makeData(props, parsed));
        }
      }
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: object({
      value: string()
        .required("Enter your answer before continuing")
        .test({
          name: "not a number",
          message: "Enter a number",
          test: (value: string | undefined) => {
            if (!value) {
              return false;
            }
            return value === "0" ? true : Boolean(parseNumber(value));
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
        <InputLabel label={props.title} hidden htmlFor="number-input">
          <Input
            ref={inputRef}
            bordered
            name="value"
            type="number"
            value={formik.values.value}
            onChange={formik.handleChange}
            errorMessage={formik.errors.value as string}
            inputProps={{
              "aria-describedby": [
                props.description ? DESCRIPTION_TEXT : "",
                formik.errors.value ? `${ERROR_MESSAGE}-${props.id}` : "",
              ]
                .filter(Boolean)
                .join(" "),
            }}
            id="number-input"
          />
        </InputLabel>
        {props.units && <InputRowLabel>{props.units}</InputRowLabel>}
      </InputRow>
    </Card>
  );
}
