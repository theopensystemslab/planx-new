import { useFormikContext } from "formik";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input/Input";

import type { ModalState, UserFormValues } from "../types";
import type { Step } from "./AddUserModal";

export const MemberFields: React.FC<{ mode: Step["stage"] | ModalState["action"] }> = ({ mode }) => {
  const { getFieldProps, touched, errors, values } =
    useFormikContext<UserFormValues>();

  if (mode === "confirm-existing") return;

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
          disabled={mode === "create-new"}
        />
      </InputLabel>

      {mode !== "email" &&
        <>
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
        </>
      }
    </InputGroup>
  );
};