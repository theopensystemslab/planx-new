import type { Meta } from "@storybook/react/types-6-0";
import React from "react";

import Wrapper from "../fixtures/Wrapper";
import _Editor from "./Editor";
import _Templates from "./Editor/Templates";

const metadata: Meta = {
  title: "PlanX Components/Notify",
};
export default metadata;

export function Editor(props: any) {
  return <_Editor {...props} />;
}

import { useFormik } from "formik";
import { useAsync } from "react-use";

const mockTemplateId = "aaaaaaaa";
const mockTemplates = [
  {
    id: mockTemplateId,
    name: "My first template",
    type: "email",
    created_at: String(new Date()),
    updated_at: String(new Date()),
    version: "1",
    created_by: "someone@example.com",
    body:
      "Hi ((name)), thank you for applying for ((service)).\n\n((service)) will respond in a few working days.",
    subject: "Your application #((id))",
    letter_contact_block: "null",
  },
];
export function Templates() {
  const formik = useFormik({
    initialValues: {
      token: "",
    },
    onSubmit: () => {},
    validate: () => {},
  });
  const request = useAsync(async () => {
    if (formik.values?.token !== "") {
      return mockTemplates;
    }
    throw Error("missing token");
  }, [formik.values?.token]);
  return (
    <>
      <_Templates request={request} formik={formik} />
    </>
  );
}
export function TemplatesWithToken() {
  const formik = useFormik({
    initialValues: {
      token: "abba",
    },
    onSubmit: () => {},
    validate: () => {},
  });
  const request = useAsync(async () => {
    if (formik.values?.token !== "") {
      return mockTemplates;
    }
    throw Error("missing token");
  }, [formik.values?.token]);
  return (
    <>
      <_Templates request={request} formik={formik} />
    </>
  );
}

export function TemplatesWithTemplateSelected() {
  const formik = useFormik({
    initialValues: {
      token: "abba",
      templateId: mockTemplateId,
    },
    onSubmit: () => {},
    validate: () => {},
  });
  const request = useAsync(async () => {
    if (formik.values?.token !== "") {
      return mockTemplates;
    }
    throw Error("missing token");
  }, [formik.values?.token]);
  return (
    <>
      <_Templates request={request} formik={formik} />
    </>
  );
}
