import { getValidSchemaValues } from "@opensystemslab/planx-core";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";
import { validationSchema } from "./model";

function Component(props: any) {
  const formik = useFormik<{
    color: string;
    definitionImg: string;
    description: string;
    fn?: string;
    howMeasured: string;
    info: string;
    notes: string;
    policyRef: string;
    title: string;
  }>({
    initialValues: {
      color: props.node?.data?.color || "#EFEFEF",
      definitionImg: props.node?.data?.definitionImg,
      description: props.node?.data?.description || "",
      fn: props.node?.data?.fn || "",
      howMeasured: props.node?.data?.howMeasured,
      info: props.node?.data?.info,
      notes: props.node?.data?.notes || "",
      policyRef: props.node?.data?.policyRef,
      title: props.node?.data?.title || "",
    },
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.FileUpload, data: newValues });
      }
    },
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
  });

  // Rather than default to generic `useStore().getFlowSchema()`
  //   File Upload components can specifically suggest based on ODP Schema enum options
  const schema = getValidSchemaValues("FileType") || [];
  // // Additionally ensure that existing initial values are supported & pre-populated on load
  if (formik.initialValues?.fn && !schema?.includes(formik.initialValues.fn))
    schema.push(formik.initialValues.fn);

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <TemplatedNodeInstructions
        isTemplatedNode={props.isTemplatedNode}
        templatedNodeInstructions={props.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          props.areTemplatedNodeInstructionsRequired
        }
      />
      <ModalSection>
        <ModalSectionContent title="File upload" Icon={ICONS[TYPES.FileUpload]}>
          <InputRow>
            <Input
              required
              format="large"
              placeholder="Title"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
              disabled={props.disabled}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.description}
            />
          </InputRow>
          <DataFieldAutocomplete
            required
            schema={schema}
            value={formik.values.fn}
            onChange={(value) => formik.setFieldValue("fn", value)}
            disabled={props.disabled}
          />
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
}

export default Component;
