import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import { Switch } from "ui/shared/Switch";

import { ICONS } from "../shared/icons";
import type { FindProperty } from "./model";
import { parseFindProperty } from "./model";

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
          title="Find property"
          Icon={ICONS[TYPES.FindProperty]}
        >
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
              name="description"
              placeholder="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </InputRow>
        </ModalSectionContent>
        <ModalSectionContent>
          <InputRow>
            <Switch
              checked={formik.values.allowNewAddresses}
              onChange={() =>
                formik.setFieldValue(
                  "allowNewAddresses",
                  !formik.values.allowNewAddresses,
                )
              }
              label="Allow users to plot new addresses without a UPRN"
            />
          </InputRow>
          {formik.values.allowNewAddresses ? (
            <>
              <InputRow>
                <Input
                  format="large"
                  placeholder="Title"
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
                      placeholder="Label"
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
      <ModalFooter formik={formik} />
    </form>
  );
}
