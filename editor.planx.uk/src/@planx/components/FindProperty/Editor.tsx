import { TYPES } from "@planx/components/types";
import {
  EditorProps,
  ICONS,
  InternalNotes,
  MoreInformation,
} from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import OptionButton from "ui/OptionButton";
import RichTextInput from "ui/RichTextInput";

import type { FindProperty } from "./model";
import { DEFAULT_TITLE, parseFindProperty } from "./model";

export type Props = EditorProps<TYPES.FindProperty, FindProperty>;

export default FindPropertyComponent;

function FindPropertyComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseFindProperty(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.FindProperty, data: newValues });
      }
    },
    validate: () => {},
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title="Find Property"
          Icon={ICONS[TYPES.FindProperty]}
        >
          <InputRow>
            <Input
              format="large"
              placeholder={DEFAULT_TITLE}
              name="title"
              value={formik.values.title}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              name="description"
              placeholder="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <OptionButton
              selected={formik.values.allowNewAddresses}
              onClick={() => {
                formik.setFieldValue(
                  "allowNewAddresses",
                  !formik.values.allowNewAddresses
                );
              }}
            >
              Allow users to plot new addresses without a UPRN
            </OptionButton>
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
        value={formik.values.notes}
        onChange={formik.handleChange}
      />
    </form>
  );
}
