import type { Pay } from "@planx/components/Pay/model";
import { parseMoreInformation } from "@planx/components/shared";
import { TYPES } from "@planx/components/types";
import { ICONS, InternalNotes, MoreInformation } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import RichTextInput from "ui/RichTextInput";

function Component(props: any) {
  const formik = useFormik<Pay>({
    initialValues: {
      // TODO: improve runtime validation here (joi, io-ts)
      title: props.node?.data?.title || "Pay for your application",
      description:
        props.node?.data?.description ||
        `<p>The planning fee covers the cost of processing your application.\
         Find out more about how planning fees are calculated \
         <a href="https://www.gov.uk/guidance/fees-for-planning-applications" target="_self">here</a>.</p>`,
      color: props.node?.data?.color || "#EFEFEF",
      fn: props.node?.data?.fn,
      url: props.node?.data?.url,
      ...parseMoreInformation(props.node?.data),
    },
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.Pay, data: newValues });
      }
    },
    validate: () => {},
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Payment" Icon={ICONS[TYPES.Pay]}>
          <InputRow>
            <Input
              format="large"
              placeholder="Title"
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
              placeholder="Data field for calculated amount"
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <Input
              name="url"
              value={formik.values.url}
              placeholder={`${process.env.REACT_APP_API_URL}/pay`}
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
