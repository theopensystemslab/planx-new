import { useFormikContext } from "formik";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input/Input";

import type { UserFormValues } from "../../types";

export const EmailField: React.FC<{ disabled?: boolean }> = ({ disabled = false }) => {
  const { getFieldProps, touched, errors, values } =
    useFormikContext<UserFormValues>();

  return (
    <InputGroup flowSpacing>
      <InputLabel label="Email address" htmlFor="email">
        <Input
          id="email"
          type="email"
          {...getFieldProps("email")}
          errorMessage={
            touched.email && errors.email ? errors.email : undefined
          }
          value={values.email}
          disabled={disabled}
        />
      </InputLabel>
    </InputGroup>
  );
};