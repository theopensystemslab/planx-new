import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import { PublicProps } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";
import InputRow from "ui/InputRow";
import InputRowItem from "ui/InputRowItem";

import type { AddressInput, UserData } from "./model";
import { userDataSchema } from "./model";

export type Props = PublicProps<AddressInput, UserData>;

export default function AddressInputComponent(props: Props): FCReturn {
  const formik = useFormik({
    initialValues: {
      line1: "",
      line2: "",
      town: "",
      county: "",
      postcode: "",
    },
    onSubmit: (values) => {
      const data = props.fn ? { [props.fn]: { value: values } } : undefined;
      props.handleSubmit?.(undefined, data);
    },
    validateOnBlur: false,
    validateOnChange: false,
    validationSchema: userDataSchema,
  });

  return (
    <Card handleSubmit={formik.handleSubmit}>
      <QuestionHeader
        title={props.title}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <InputLabel label="building and street">
        <Input
          name="line1"
          value={formik.values.line1}
          placeholder="Line 1"
          bordered
          errorMessage={formik.errors.line1}
          onChange={formik.handleChange}
        />
      </InputLabel>
      <InputRow>
        <Input
          name="line2"
          value={formik.values.line2}
          placeholder="Line 2"
          bordered
          errorMessage={formik.errors.line2}
          onChange={formik.handleChange}
        />
      </InputRow>
      <InputLabel label="town">
        <Input
          name="town"
          value={formik.values.town}
          placeholder="Town"
          bordered
          errorMessage={formik.errors.town}
          onChange={formik.handleChange}
        />
      </InputLabel>
      <InputLabel label="county">
        <Input
          name="county"
          value={formik.values.county}
          placeholder="County"
          bordered
          errorMessage={formik.errors.county}
          onChange={formik.handleChange}
        />
      </InputLabel>
      <InputLabel label="postal code">
        <InputRowItem width="40%">
          <Input
            name="postcode"
            value={formik.values.postcode}
            placeholder="Postal code"
            bordered
            errorMessage={formik.errors.postcode}
            onChange={formik.handleChange}
          />
        </InputRowItem>
      </InputLabel>
    </Card>
  );
}
