import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";
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

  const isTemplate = useStore.getState().isTemplate;

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title="Address input"
          Icon={ICONS[TYPES.AddressInput]}
        >
          <InputRow>
            <Input
              format="large"
              name="title"
              value={formik.values.title}
              placeholder="Title"
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
            />
          </InputRow>
          <DataFieldAutocomplete
            required
            value={formik.values.fn}
            onChange={(value) => formik.setFieldValue("fn", value)}
            disabled={props.disabled}
          />
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter
        formik={formik}
        disabled={props.disabled}
        isTemplate={isTemplate}
      />
    </form>
  );
}
