import Box from "@mui/material/Box";
import { visuallyHidden } from "@mui/utils";
import {
  DateInput,
  paddedDate,
  UserData,
} from "@planx/components/DateInput/model";
import { dateRangeSchema } from "@planx/components/DateInput/model";
import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import DateInputComponent from "ui/DateInput";
import InputRow from "ui/InputRow";
import { object } from "yup";

import { DESCRIPTION_TEXT, ERROR_MESSAGE } from "../shared/constants";
import { getPreviouslySubmittedData, makeData } from "../shared/utils";

export type Props = PublicProps<DateInput, UserData>;

const DateInputPublic: React.FC<Props> = (props) => {
  const formik = useFormik({
    initialValues: {
      date: getPreviouslySubmittedData(props) ?? "",
    },
    onSubmit: (values) => {
      props.handleSubmit?.(makeData(props, values.date));
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: object({
      date: dateRangeSchema({ min: props.min, max: props.max }),
    }),
  });

  return (
    <Card handleSubmit={formik.handleSubmit}>
      <Box
        component="fieldset"
        sx={{ p: 0, border: 0 }}
        role="group"
        aria-describedby={[
          props.description ? DESCRIPTION_TEXT : "",
          formik.errors.date ? ERROR_MESSAGE : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <legend style={visuallyHidden}>{props.title}</legend>
        <QuestionHeader
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
            id={props.id}
          />
        </InputRow>
      </Box>
    </Card>
  );
};

export default DateInputPublic;
