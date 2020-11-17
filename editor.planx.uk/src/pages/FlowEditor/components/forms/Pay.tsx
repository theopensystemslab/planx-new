import { useFormik } from "formik";
import { Pay } from "planx-nodes/Pay/types";
import { parseMoreInformation } from "planx-nodes/shared";
import { TYPES } from "planx-nodes/types";
import React from "react";
import {
  Input,
  InputRow,
  ModalSection,
  ModalSectionContent,
  RichTextInput,
} from "ui";

import { ICONS } from "../shared";
import { InternalNotes, MoreInformation } from "./shared";

function Component(props) {
  const formik = useFormik<Pay>({
    initialValues: {
      // TODO: improve runtime validation here (joi, io-ts)
      title: props.node?.data?.title || "",
      description: props.node?.data?.description || "",
      color: props.node?.data?.color || "#EFEFEF",
      fn: props.node?.data?.fn,
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
              placeholder="Payment"
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
