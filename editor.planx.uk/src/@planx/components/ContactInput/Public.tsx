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
import type { Contact, ContactInput } from "./model";
import { userDataSchema } from "./model";

export type Props = PublicProps<ContactInput, Contact>;

interface FormProps {
  title: string;
  firstName: string;
  lastName: string;
  organisation: string;
  phone: string;
  email: string;
}

export default function ContactInputComponent(props: Props): FCReturn {
  const formik = useFormik<FormProps>({
    initialValues: getPreviouslySubmittedData(props) ?? {
      title: "",
      firstName: "",
      lastName: "",
      organisation: "",
      phone: "",
      email: "",
    },
    onSubmit: (values) => {
      // // map values to expected granular passport variable names before submitting
      // values["name.first"] = values.firstName;
      // delete values.firstName;

      // values["name.last"] = values.lastName;
      // delete values.lastName;

      // values["company.name"] = values.organisation;
      // delete values.organisation;

      // values["phone.primary"] = values.phone;
      // delete values.phone;

      // update passport on submit
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
      <InputLabel label="Title">
        <InputRowItem width="40%">
          <Input
            name="title"
            value={formik.values.title}
            bordered
            errorMessage={formik.errors.title}
            onChange={formik.handleChange}
            id={`${props.id}-title`}
            inputProps={{
              "aria-describedby": formik.errors.title
                ? `${ERROR_MESSAGE}-${props.id}-title`
                : "",
            }}
          />
        </InputRowItem>
      </InputLabel>
      <InputLabel label="First name">
        <Input
          name="firstName"
          value={formik.values.firstName}
          bordered
          errorMessage={formik.errors.firstName}
          onChange={formik.handleChange}
          id={`${props.id}-firstName`}
          inputProps={{
            "aria-describedby": formik.errors.firstName
              ? `${ERROR_MESSAGE}-${props.id}-firstName`
              : "",
          }}
        />
      </InputLabel>
      <InputLabel label="Last name">
        <Input
          name="lastName"
          value={formik.values.lastName}
          bordered
          errorMessage={formik.errors.lastName}
          onChange={formik.handleChange}
          id={`${props.id}-lastName`}
          inputProps={{
            "aria-describedby": formik.errors.lastName
              ? `${ERROR_MESSAGE}-${props.id}-lastName`
              : "",
          }}
        />
      </InputLabel>
      <InputLabel label="Organisation (optional)">
        <Input
          name="organisation"
          value={formik.values.organisation}
          bordered
          errorMessage={formik.errors.organisation}
          onChange={formik.handleChange}
        />
      </InputLabel>
      <InputLabel label="Phone number">
        <Input
          name="phone"
          type="phone"
          value={formik.values.phone}
          bordered
          errorMessage={formik.errors.phone}
          onChange={formik.handleChange}
          id={`${props.id}-phone`}
          inputProps={{
            "aria-describedby": formik.errors.phone
              ? `${ERROR_MESSAGE}-${props.id}-phone`
              : "",
          }}
        />
      </InputLabel>
      <InputLabel label="Email address">
        <InputRowItem>
          <Input
            name="email"
            type="email"
            value={formik.values.email}
            bordered
            errorMessage={formik.errors.email}
            onChange={formik.handleChange}
            id={`${props.id}`}
            inputProps={{
              "aria-describedby": formik.errors.email
                ? `${ERROR_MESSAGE}-${props.id}-email`
                : "",
            }}
          />
        </InputRowItem>
      </InputLabel>
    </Card>
  );
}
