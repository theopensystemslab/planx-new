import Box from "@mui/material/Box";
import {
  DateInput,
  dateInputValidationSchema,
  normalizeDate,
  paddedDate,
  UserData,
} from "@planx/components/DateInput/model";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import { PublicProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import React, { useEffect, useId } from "react";
import DateInputComponent from "ui/shared/DateInput/DateInput";
import InputRow from "ui/shared/InputRow";
import { object } from "yup";

import { DESCRIPTION_TEXT, ERROR_MESSAGE } from "../shared/constants";
import { getPreviouslySubmittedData, makeData } from "../shared/utils";

export type Props = PublicProps<DateInput> & { autoAnswer?: UserData };

const DateInputPublic: React.FC<Props> = (props) => {
  const uniqueId = useId();
  const componentId = props.id ? props.id : uniqueId;

  const formik = useFormik({
    initialValues: {
      date: getPreviouslySubmittedData(props) ?? "",
    },
    onSubmit: (values) => {
      const normalizedDate = normalizeDate(values.date);
      props.handleSubmit?.(makeData(props, normalizedDate));
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: object({
      date: dateInputValidationSchema({ data: props, required: true }),
    }),
  });

  // Auto-answered DateInputs still set a breadcrumb even though they render null
  useEffect(() => {
    if (props.autoAnswer) {
      props.handleSubmit?.({
        ...makeData(props, props.autoAnswer),
        auto: true,
      });
    }
  }, [props.autoAnswer, props.handleSubmit]);

  // Auto-answered DateInputs are not publicly visible
  if (props.autoAnswer) {
    return null;
  }

  return (
    <Card handleSubmit={formik.handleSubmit}>
      <Box
        role="group"
        aria-labelledby="group-label"
        aria-describedby={
          [
            props.description ? DESCRIPTION_TEXT : "",
            formik.errors.date ? ERROR_MESSAGE : "",
          ]
            .filter(Boolean)
            .join(" ") || undefined
        }
      >
        <CardHeader
          titleId="group-label"
          title={props.title}
          description={props.description}
          info={props.info}
          policyRef={props.policyRef}
          howMeasured={props.howMeasured}
        />
        <InputRow>
          <DateInputComponent
            value={formik.values.date}
            bordered
            onChange={(newDate: string, eventType: string) => {
              // Pad it here if necessary; keep DateInputComponent simple
              formik.setFieldValue("date", paddedDate(newDate, eventType));
            }}
            error={formik.errors.date as string}
            id={componentId}
          />
        </InputRow>
      </Box>
    </Card>
  );
};

export default DateInputPublic;
