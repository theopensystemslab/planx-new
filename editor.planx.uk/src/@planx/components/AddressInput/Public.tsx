import { Address } from "@opensystemslab/planx-core/types";
import Card from "@planx/components/shared/Preview/Card";
import { CardHeader } from "@planx/components/shared/Preview/CardHeader/CardHeader";
import type { PublicProps } from "@planx/components/shared/types";
import { FormikErrors, useFormik } from "formik";
import React, { useEffect } from "react";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import InputRowItem from "ui/shared/InputRowItem";

import { ERROR_MESSAGE } from "../shared/constants";
import { getPreviouslySubmittedData, makeData } from "../shared/utils";
import type { AddressInput } from "./model";
import { addressValidationSchema } from "./model";

export type Props = PublicProps<AddressInput>;

export default function AddressInputComponent(props: Props): FCReturn {
  const formik = useFormik<Address>({
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
    validationSchema: addressValidationSchema,
  });

  // Auto-answered AddressInputs still set a breadcrumb even though they render null
  useEffect(() => {
    if (props.autoAnswer) {
      props.handleSubmit?.({
        ...makeData(props, props.autoAnswer),
        auto: true,
      });
    }
  }, [props.autoAnswer, props.handleSubmit]);

  // Auto-answered AddressInputs are not publicly visible
  if (props.autoAnswer) {
    return null;
  }

  return (
    <Card handleSubmit={formik.handleSubmit}>
      <CardHeader
        title={props.title}
        description={props.description}
        info={props.info}
        policyRef={props.policyRef}
        howMeasured={props.howMeasured}
      />
      <AddressFields
        id={props.id}
        values={formik.values}
        errors={formik.errors}
        handleChange={formik.handleChange}
      />
    </Card>
  );
}

export interface AddressFieldsProps {
  id?: string;
  values: Address;
  errors: FormikErrors<Address>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AddressFields(props: AddressFieldsProps): FCReturn {
  return (
    <>
      <InputLabel label="Address line 1">
        <Input
          autoComplete="address-line1"
          name="line1"
          value={props.values?.line1}
          bordered
          errorMessage={props.errors?.line1}
          onChange={props.handleChange}
          id={`${props.id}-line1`}
          inputProps={{
            "aria-describedby": props.errors?.line1
              ? `${ERROR_MESSAGE}-${props.id}-line1`
              : "",
          }}
        />
      </InputLabel>
      <InputLabel label="Address line 2 (optional)">
        <Input
          autoComplete="address-line2"
          name="line2"
          value={props.values?.line2}
          bordered
          errorMessage={props.errors?.line2}
          onChange={props.handleChange}
        />
      </InputLabel>
      <InputLabel label="Town">
        <Input
          autoComplete="address-level2"
          name="town"
          value={props.values?.town}
          bordered
          errorMessage={props.errors?.town}
          onChange={props.handleChange}
          id={`${props.id}-town`}
          inputProps={{
            "aria-describedby": props.errors?.town
              ? `${ERROR_MESSAGE}-${props.id}-town`
              : "",
          }}
        />
      </InputLabel>
      <InputLabel label="County (optional)">
        <Input
          autoComplete="address-level1"
          name="county"
          value={props.values?.county}
          bordered
          errorMessage={props.errors?.county}
          onChange={props.handleChange}
        />
      </InputLabel>
      <InputLabel label="Postcode">
        <InputRowItem width="40%">
          <Input
            name="postcode"
            value={props.values?.postcode}
            bordered
            errorMessage={props.errors?.postcode}
            onChange={props.handleChange}
            id={`${props.id}-postcode`}
            inputProps={{
              "aria-describedby": props.errors?.postcode
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
            value={props.values?.country}
            bordered
            errorMessage={props.errors?.country}
            onChange={props.handleChange}
          />
        </InputRowItem>
      </InputLabel>
    </>
  );
}
