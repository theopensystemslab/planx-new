import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { ICONS } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

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
    validate: () => {},
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="File upload" Icon={ICONS[TYPES.FileUpload]}>
          <InputRow>
            <Input
              format="large"
              placeholder="File Upload"
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <Input
              required
              format="data"
              name="fn"
              value={formik.values.fn}
              placeholder="Data Field"
              onChange={formik.handleChange}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} />
    </form>
  );
}

export default Component;
