import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { toggleExpandableChecklist } from "@planx/components/shared/BaseChecklist/model";
import { DataFieldAutocomplete } from "@planx/components/shared/DataFieldAutocomplete";
import { EditorProps } from "@planx/components/shared/types";
import { getIn, useFormik } from "formik";
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

import { ICONS } from "../../shared/icons";
import {
  ChecklistWithOptions,
  FlatOptions,
  GroupedOptions,
  parseChecklist,
  validationSchema,
} from "../model";
import { Checklist } from "../model";
import { Options } from "./Options";

type ExtraProps = FlatOptions | GroupedOptions;
type Props = EditorProps<TYPES.Checklist, Checklist, ExtraProps>;

export const ChecklistEditor: React.FC<Props> = (props) => {
  const type = TYPES.Checklist;

  const formik = useFormik<ChecklistWithOptions>({
    initialValues: parseChecklist({
      ...props.node?.data,
      options: props?.options,
      groupedOptions: props?.groupedOptions,
    }),
    onSubmit: ({ options, groupedOptions, ...values }) => {
      const sourceOptions = options?.length
        ? options
        : groupedOptions?.flatMap((group) => group.children);

      const filteredOptions = (sourceOptions || []).filter(
        (option) => option.data.text,
      );

      const processedOptions = filteredOptions.map((option) => ({
        ...option,
        id: option.id || undefined,
        type: TYPES.Answer as const,
      }));

      if (props.handleSubmit) {
        props.handleSubmit(
          {
            type,
            data: {
              ...values,
              ...(groupedOptions
                ? {
                    categories: groupedOptions.map((group) => ({
                      title: group.title,
                      count: group.children.length,
                    })),
                  }
                : {
                    categories: undefined,
                  }),
            },
          },
          processedOptions,
        );
      } else {
        alert(JSON.stringify({ type, ...values, options }, null, 2));
      }
    },
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
  });

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
        <ModalSectionContent title="Checklist" Icon={ICONS[type]}>
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

export default ChecklistEditor;
