import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";
import InputRowItem from "ui/InputRowItem";

import { ERROR_MESSAGE } from "../shared/constants";
import { getPreviouslySubmittedData, makeData } from "../shared/utils";
import type { Address, AddressInput } from "./model";
import { userDataSchema } from "./model";

export type Props = PublicProps<AddressInput, Address>;

interface FormProps {
  line1: string;
  line2: string;
  town: string;
  county: string;
  postcode: string;
  country: string;
}

export default function AddressInputComponent(props: Props): FCReturn {
  const formik = useFormik<FormProps>({
    initialValues: getPreviouslySubmittedData(props) ?? {
      line1: "",
      line2: "",
      town: "",
      county: "",
      postcode: "",
      country: "",
    },
    onSubmit: (values) => {
      props.handleSubmit?.(makeData(props, values));
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
      <InputLabel label="Address line 1">
        <Input
          name="line1"
          value={formik.values.line1}
          bordered
          errorMessage={formik.errors.line1}
          onChange={formik.handleChange}
          id={`${props.id}-line1`}
          inputProps={{
            "aria-describedby": formik.errors.line1
              ? `${ERROR_MESSAGE}-${props.id}-line1`
              : "",
          }}
        />
      </InputLabel>
      <InputLabel label="Address line 2 (optional)">
        <Input
          name="line2"
          value={formik.values.line2}
          bordered
          errorMessage={formik.errors.line2}
          onChange={formik.handleChange}
        />
      </InputLabel>
      <InputLabel label="Town">
        <Input
          name="town"
          value={formik.values.town}
          bordered
          errorMessage={formik.errors.town}
          onChange={formik.handleChange}
          id={`${props.id}-town`}
          inputProps={{
            "aria-describedby": formik.errors.town
              ? `${ERROR_MESSAGE}-${props.id}-town`
              : "",
          }}
        />
      </InputLabel>
      <InputLabel label="County (optional)">
        <Input
          name="county"
          value={formik.values.county}
          bordered
          errorMessage={formik.errors.county}
          onChange={formik.handleChange}
        />
      </InputLabel>
      <InputLabel label="Postcode">
        <InputRowItem width="40%">
          <Input
            name="postcode"
            value={formik.values.postcode}
            bordered
            errorMessage={formik.errors.postcode}
            onChange={formik.handleChange}
            id={`${props.id}-postcode`}
            inputProps={{
              "aria-describedby": formik.errors.postcode
                ? `${ERROR_MESSAGE}-${props.id}-postcode`
                : "",
            }}
          />
        </InputRowItem>
      </InputLabel>
      <InputLabel label="Country (optional)">
        <InputRowItem>
          <Input
            name="country"
            value={formik.values.country}
            bordered
            errorMessage={formik.errors.country}
            onChange={formik.handleChange}
          />
        </InputRowItem>
      </InputLabel>
    </Card>
  );
}
