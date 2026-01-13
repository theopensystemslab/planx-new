import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import React from "react";
import InputGroup from "ui/editor/InputGroup";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import { Switch } from "ui/shared/Switch";

import { ICONS } from "../shared/icons";
import type { FindProperty } from "./model";
import { parseFindProperty, validationSchema } from "./model";

export type Props = EditorProps<TYPES.FindProperty, FindProperty>;

export default FindPropertyComponent;

function FindPropertyComponent(props: Props) {
  const formik = useFormik<FindProperty>({
    initialValues: parseFindProperty(props.node?.data),
    onSubmit: (newValues) => {
      if (props.handleSubmit) {
        props.handleSubmit({ type: TYPES.FindProperty, data: newValues });
      }
    },
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
  });
  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <TemplatedNodeInstructions
        isTemplatedNode={formik.values.isTemplatedNode}
        templatedNodeInstructions={formik.values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          formik.values.areTemplatedNodeInstructionsRequired
        }
      />
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
              disabled={props.disabled}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              name="description"
              placeholder="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.description}
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
              disabled={props.disabled}
            />
          </InputRow>
          {formik.values.allowNewAddresses ? (
            <>
              <InputRow>
                <Switch
                  checked={formik.values.newAddressFirstPage}
                  onChange={() => 
                    formik.setFieldValue(
                      "newAddressFirstPage",
                      !formik.values.newAddressFirstPage,
                    )
                  }
                  label="Show the new address map as the primary journey, and existing postcode/address inputs page secondary"
                  disabled={props.disabled}
                />
              </InputRow>
              <br />
              <InputRow>
                <Input
                  format="large"
                  placeholder="Title"
                  name="newAddressTitle"
                  value={formik.values.newAddressTitle}
                  onChange={formik.handleChange}
                  disabled={props.disabled}
                />
              </InputRow>
              <InputRow>
                <RichTextInput
                  name="newAddressDescription"
                  placeholder="Description"
                  value={formik.values.newAddressDescription}
                  onChange={formik.handleChange}
                  disabled={props.disabled}
                  errorMessage={formik.errors.newAddressDescription}
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
                      disabled={props.disabled}
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
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
}
