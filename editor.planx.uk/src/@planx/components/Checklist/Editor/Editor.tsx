import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { DataFieldAutocomplete } from "@planx/components/shared/DataFieldAutocomplete";
import { FormikErrors, FormikValues, useFormik } from "formik";
import React, { useEffect, useRef } from "react";
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

import { Option, parseBaseNodeData } from "../../shared";
import { ICONS } from "../../shared/icons";
import type { Checklist } from "../model";
import { toggleExpandableChecklist, validationSchema } from "../model";
import { ChecklistProps } from "../types";
import { Options } from "./Options";

export const ChecklistEditor: React.FC<ChecklistProps> = (props) => {
  const type = TYPES.Checklist;

  const formik = useFormik<Checklist>({
    initialValues: {
      allRequired: props.node?.data?.allRequired || false,
      neverAutoAnswer: props.node?.data?.neverAutoAnswer || false,
      alwaysAutoAnswerBlank: props.node?.data?.alwaysAutoAnswerBlank || false,
      description: props.node?.data?.description || "",
      fn: props.node?.data?.fn || "",
      groupedOptions: props.groupedOptions,
      img: props.node?.data?.img || "",
      options: props.options,
      text: props.node?.data?.text || "",
      ...parseBaseNodeData(props.node?.data),
    },
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
        type: TYPES.Answer,
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
    validate: ({ options, groupedOptions, ...values }) => {
      const errors: FormikErrors<FormikValues> = {};

      // Account for flat or expandable Checklist options
      options = options || groupedOptions?.flatMap((group) => group.children);

      if (values.alwaysAutoAnswerBlank && !values.fn) {
        errors.alwaysAutoAnswerBlank =
          "Set a data field for the Checklist and all options but one when never putting to user";
      }
      if (
        values.alwaysAutoAnswerBlank &&
        values.fn &&
        options?.filter((option) => !option.data.val).length !== 1
      ) {
        errors.alwaysAutoAnswerBlank =
          "Exactly one option should have a blank data field when never putting to user";
      }
      return errors;
    },
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
  });

  const focusRef = useRef<HTMLInputElement | null>(null);

  // horrible hack to remove focus from Rich Text Editor
  useEffect(() => {
    setTimeout(() => {
      (document.activeElement as any).blur();
      focusRef.current?.focus();
    }, 50);
  }, []);

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
                value={formik.values.fn}
                onChange={(value) => formik.setFieldValue("fn", value)}
                disabled={props.disabled}
              />
            </ErrorWrapper>
            <InputRow>
              <Switch
                checked={!!formik.values.groupedOptions}
                onChange={() =>
                  formik.setValues({
                    ...formik.values,
                    ...toggleExpandableChecklist({
                      options: formik.values.options,
                      groupedOptions: formik.values.groupedOptions,
                    }),
                  })
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
        <ErrorWrapper error={formik.errors.options}>
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
