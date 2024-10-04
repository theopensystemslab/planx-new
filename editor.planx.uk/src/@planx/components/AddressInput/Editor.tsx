import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import {
  EditorProps,
  ICONS,
} from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";

import { AddressInput, parseAddressInput } from "./model";

export type Props = EditorProps<TYPES.AddressInput, AddressInput>;

export default function AddressInputComponent(props: Props): FCReturn {
  const formik = useFormik({
    initialValues: parseAddressInput(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({
          type: TYPES.AddressInput,
          data: newValues,
        });
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title="Address Input"
          Icon={ICONS[TYPES.AddressInput]}
        >
          <InputRow>
            <Input
              format="large"
              name="title"
              value={formik.values.title}
              placeholder="Title"
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
