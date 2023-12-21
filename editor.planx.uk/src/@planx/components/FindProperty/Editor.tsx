import { TYPES } from "@planx/components/types";
import {
  EditorProps,
  ICONS,
  InternalNotes,
  MoreInformation,
} from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import OptionButton from "ui/editor/OptionButton";
import RichTextInput from "ui/editor/RichTextInput";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import type { FindProperty } from "./model";
import {
  DEFAULT_NEW_ADDRESS_LABEL,
  DEFAULT_NEW_ADDRESS_TITLE,
  DEFAULT_TITLE,
  parseFindProperty,
} from "./model";

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
        </ModalSectionContent>
        <ModalSectionContent>
          <InputRow>
            <OptionButton
              selected={formik.values.allowNewAddresses}
              onClick={() => {
                formik.setFieldValue(
                  "allowNewAddresses",
                  !formik.values.allowNewAddresses,
                );
              }}
            >
              Allow users to plot new addresses without a UPRN
            </OptionButton>
          </InputRow>
          {formik.values.allowNewAddresses ? (
            <>
              <InputRow>
                <Input
                  format="large"
                  placeholder={DEFAULT_NEW_ADDRESS_TITLE}
                  name="newAddressTitle"
                  value={formik.values.newAddressTitle}
                  onChange={formik.handleChange}
                />
              </InputRow>
              <InputRow>
                <RichTextInput
                  name="newAddressDescription"
                  placeholder="Description"
                  value={formik.values.newAddressDescription}
                  onChange={formik.handleChange}
                />
              </InputRow>
              <InputGroup label="New address description label">
                <InputRow>
                  <InputRowItem width="100%">
                    <Input
                      id="new-address-description-label"
                      placeholder={DEFAULT_NEW_ADDRESS_LABEL}
                      name="newAddressDescriptionLabel"
                      value={formik.values.newAddressDescriptionLabel}
                      onChange={formik.handleChange}
                    />
                  </InputRowItem>
                </InputRow>
              </InputGroup>
            </>
          ) : (
            <></>
          )}
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
