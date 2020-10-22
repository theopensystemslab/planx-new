import { useFormik } from "formik";
import React from "react";
import {
  Input,
  InputRow,
  InternalNotes,
  ModalSection,
  ModalSectionContent,
  RichTextInput,
} from "ui";
import { TYPES } from "../../../data/types";
import { ICONS } from "../../shared";
import { MoreInformation } from "../shared";

function Component(props) {
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
      // TODO: improve runtime validation here (joi, io-ts)
      title: props.node?.title || "",
      description: props.node?.description || "",
      color: props.node?.color || "#EFEFEF",
      notes: props.node?.notes || "",
      definitionImg: props.node?.definitionImg,
      howMeasured: props.node?.howMeasured,
      policyRef: props.node?.policyRef,
      info: props.node?.info,
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
              // required
              format="data"
              name="fn"
              value={formik.values.fn}
              placeholder="Data Field"
              onChange={formik.handleChange}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <MoreInformation
        changeField={formik.handleChange}
        definitionImg={formik.values.definitionImg}
        definitionName="howMeasured"
        definitionValue={formik.values.howMeasured}
        policyName="policyRef"
        policyValue={formik.values.policyRef}
        whyName="info"
        whyValue={formik.values.info}
      />
      <InternalNotes
        name="notes"
        onChange={formik.handleChange}
        value={formik.values.notes}
      />
    </form>
  );
}

export default Component;
