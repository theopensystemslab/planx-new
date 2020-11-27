import { TYPES } from "@planx/components/types";
import { ICONS } from "@planx/components/ui";
import { InternalNotes, MoreInformation } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import RichTextInput from "ui/RichTextInput";

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
      title: props.node?.data?.title || "",
      description: props.node?.data?.description || "",
      color: props.node?.data?.color || "#EFEFEF",
      notes: props.node?.data?.notes || "",
      definitionImg: props.node?.data?.definitionImg,
      howMeasured: props.node?.data?.howMeasured,
      policyRef: props.node?.data?.policyRef,
      info: props.node?.data?.info,
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
        howMeasured={formik.values.howMeasured}
        policyRef={formik.values.policyRef}
        info={formik.values.info}
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
