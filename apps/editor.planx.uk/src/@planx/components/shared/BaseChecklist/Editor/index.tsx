import { ComponentType } from "@opensystemslab/planx-core/types";
import { Options } from "@planx/components/shared/BaseChecklist/Editor/components/Options";
import { toggleExpandableChecklist } from "@planx/components/shared/BaseChecklist/model";
import { DataFieldAutocomplete } from "@planx/components/shared/DataFieldAutocomplete";
import { getIn } from "formik";
import React, { useRef } from "react";
import ImgInput from "ui/editor/ImgInput/ImgInput";
import InputGroup from "ui/editor/InputGroup";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { ICONS } from "../../icons";
import { Props } from "./types";

/**
 * Shared editor component for Checklist and ResponsiveChecklist components
 * Renders shared UI across both types, and conditionally renders unique fields
 *
 * Uses custom components (MoreInformation, TemplateNodeConfiguration) for
 * type-narrowing. This passes either ChecklistProps or ResponsiveChecklistProps
 * to children, not the ChecklistProps | ResponsiveChecklistProps union
 */
export const BaseChecklistComponent: React.FC<Props> = (props) => {
  const { type, formik } = props;
  const title =
    type === ComponentType.Checklist ? "Checklist" : "Responsive checklist";

  const focusRef = useRef<HTMLInputElement | null>(null);

  return (
    <form
      onSubmit={formik.handleSubmit}
      id="modal"
      data-testid="checklistEditorForm"
    >
      <TemplatedNodeInstructions
        isTemplatedNode={formik.values.isTemplatedNode}
        templatedNodeInstructions={formik.values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          formik.values.areTemplatedNodeInstructionsRequired
        }
      />
      <ModalSection>
        <ModalSectionContent title={title} Icon={ICONS[type]}>
          <InputGroup>
            <InputRow>
              <Input
                format="large"
                name="text"
                value={formik.values.text}
                placeholder="Text"
                onChange={formik.handleChange}
                inputRef={focusRef}
                errorMessage={formik.errors.text}
                disabled={props.disabled}
              />
              <ImgInput
                img={formik.values.img}
                onChange={(newUrl) => {
                  formik.setFieldValue("img", newUrl);
                }}
                disabled={props.disabled}
              />
            </InputRow>
            <InputRow>
              <RichTextInput
                name="description"
                value={formik.values.description}
                placeholder="Description"
                onChange={formik.handleChange}
                disabled={props.disabled}
                errorMessage={formik.errors.description}
              />
            </InputRow>
            <ErrorWrapper error={formik.errors.fn}>
              <DataFieldAutocomplete
                data-testid="checklist-data-field"
                value={formik.values.fn}
                onChange={(value) => formik.setFieldValue("fn", value)}
                disabled={props.disabled}
              />
            </ErrorWrapper>
            <InputRow>
              <Switch
                checked={!!formik.values.groupedOptions}
                onChange={() =>
                  formik.setValues(toggleExpandableChecklist(formik.values))
                }
                label="Expandable"
                disabled={props.disabled}
              />
            </InputRow>
            <InputRow>
              <Switch
                checked={formik.values.allRequired}
                onChange={() =>
                  formik.setFieldValue(
                    "allRequired",
                    !formik.values.allRequired,
                  )
                }
                label="All required"
                disabled={props.disabled}
              />
            </InputRow>
            <InputRow>
              <Switch
                checked={formik.values.neverAutoAnswer}
                onChange={() =>
                  formik.setFieldValue(
                    "neverAutoAnswer",
                    !formik.values.neverAutoAnswer,
                  )
                }
                label="Always put to user (forgo automation)"
                disabled={props.disabled}
              />
            </InputRow>
            <ErrorWrapper error={formik.errors.alwaysAutoAnswerBlank}>
              <InputRow>
                <Switch
                  checked={formik.values.alwaysAutoAnswerBlank}
                  onChange={() =>
                    formik.setFieldValue(
                      "alwaysAutoAnswerBlank",
                      !formik.values.alwaysAutoAnswerBlank,
                    )
                  }
                  label="Never put to user (default to blank automation)"
                  disabled={props.disabled}
                />
              </InputRow>
            </ErrorWrapper>
          </InputGroup>
        </ModalSectionContent>
        <ErrorWrapper error={getIn(formik.errors, "options")}>
          <Options
            formik={formik}
            disabled={props.disabled}
            isTemplatedNode={props.node?.data?.isTemplatedNode}
          />
        </ErrorWrapper>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
};
