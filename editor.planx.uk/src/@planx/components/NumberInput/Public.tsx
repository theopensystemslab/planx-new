import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { PublicProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import isNil from "lodash/isNil";
import React, { useEffect, useId, useRef } from "react";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowLabel from "ui/shared/InputRowLabel";

import { ERROR_MESSAGE } from "../shared/constants";
import { getPreviouslySubmittedData, makeData } from "../shared/utils";
import type { NumberInput } from "./model";
import { parseNumber, publicValidationSchema } from "./model";

export type Props = PublicProps<NumberInput>;

export default function NumberInputComponent(props: Props): FCReturn {
  const uniqueId = useId();
  const inputId = `number-input-${uniqueId}`;
  const labelId = `input-label-${uniqueId}`;

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
    validationSchema: publicValidationSchema({ data: props, required: true }),
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    props.autoFocus && inputRef.current?.focus();
  }, [props.autoFocus]);

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
        <Input
          ref={inputRef}
          bordered
          name="value"
          type="number"
          value={formik.values.value}
          onChange={formik.handleChange}
          errorMessage={formik.errors.value as string}
          inputProps={{
            "aria-describedby": formik.errors.value
              ? `${ERROR_MESSAGE}-${props.id}`
              : "",
            "aria-labelledby": labelId,
          }}
          id={inputId}
        />
        {props.units && (
          <InputRowLabel inputProps={{ id: labelId }}>
            {props.units}
          </InputRowLabel>
        )}
      </InputRow>
    </Card>
  );
}
