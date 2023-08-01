import Card from "@planx/components/shared/Preview/Card";
import QuestionHeader from "@planx/components/shared/Preview/QuestionHeader";
import type { PublicProps } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputLabel from "ui/InputLabel";
import InputRowItem from "ui/InputRowItem";

import { ERROR_MESSAGE } from "../shared/constants";
import type { Contact, ContactInput } from "./model";
import { userDataSchema } from "./model";

export type Props = PublicProps<ContactInput>;

export default function ContactInputComponent(props: Props): FCReturn {
  const previouslySubmittedData =
    props.fn &&
    props.previouslySubmittedData?.data?.[`_contact.${props.fn}`]?.[
      `${props.fn}`
    ];
  const formik = useFormik<Contact>({
    initialValues: previouslySubmittedData ?? {
      title: "",
      firstName: "",
      lastName: "",
      organisation: "",
      phone: "",
      email: "",
    },
    onSubmit: (values) => {
      // map values to the existing/expected passport structure to minimize conditional handling later in Send schemas, etc
      const newPassportData: any = {};
      newPassportData[`${props.fn}.title`] = values.title;
      newPassportData[`${props.fn}.name.first`] = values.firstName;
      newPassportData[`${props.fn}.name.last`] = values.lastName;
      newPassportData[`${props.fn}.company.name`] = values.organisation;
      newPassportData[`${props.fn}.phone.primary`] = values.phone;
      newPassportData[`${props.fn}.email`] = values.email;

      const passportData = {
        [`_contact.${props.fn}`]: { [`${props.fn}`]: values },
        ...newPassportData,
      };

      const submissionData: any = {
        data: passportData,
      };

      // update passport on submit
      props.handleSubmit?.(submissionData);
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
      <InputLabel label="Title (optional)">
        <InputRowItem width="40%">
          <Input
            name="title"
            value={formik.values.title}
            bordered
            errorMessage={formik.errors.title}
            onChange={formik.handleChange}
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
            id={`${props.id}-email`}
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
