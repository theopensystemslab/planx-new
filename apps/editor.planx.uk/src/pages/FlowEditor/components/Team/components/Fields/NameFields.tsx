import { useFormikContext } from "formik";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input/Input";

import type { UserFormValues } from "../../types";

export const NameFields = () => {
  const { getFieldProps, touched, errors, values } =
    useFormikContext<UserFormValues>();

  return (
    <InputGroup flowSpacing>
      <InputLabel label="First name" htmlFor="firstName">
        <Input
          id="firstName"
          type="text"
          {...getFieldProps("firstName")}
          errorMessage={
            touched.firstName && errors.firstName ? errors.firstName : undefined
          }
          value={values.firstName}
        />
      </InputLabel>
      <InputLabel label="Last name" htmlFor="lastName">
        <Input
          id="lastName"
          type="text"
          {...getFieldProps("lastName")}
          errorMessage={
            touched.lastName && errors.lastName ? errors.lastName : undefined
          }
          value={values.lastName}
        />
      </InputLabel>
    </InputGroup>
  );
};