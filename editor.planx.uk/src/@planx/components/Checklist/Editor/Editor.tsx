import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { FormikErrors, FormikValues, useFormik } from "formik";
import React, { useEffect, useRef } from "react";
import ImgInput from "ui/editor/ImgInput/ImgInput";
import InputGroup from "ui/editor/InputGroup";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { parseBaseNodeData } from "../../shared";
import { ICONS } from "../../shared/icons";
import type { Checklist } from "../model";
import { toggleExpandableChecklist } from "../model";
import { ChecklistProps } from "../types";
import { Options } from "./Options";

export const ChecklistEditor: React.FC<ChecklistProps> = (props) => {
  const type = TYPES.Checklist;

  const formik = useFormik<Checklist>({
    initialValues: {
      allRequired: props.node?.data?.allRequired || false,
      neverAutoAnswer: props.node?.data?.neverAutoAnswer || false,
      description: props.node?.data?.description || "",
      fn: props.node?.data?.fn || "",
      groupedOptions: props.groupedOptions,
      img: props.node?.data?.img || "",
      options: props.options,
      text: props.node?.data?.text || "",
      exclusiveOrOption: props.exclusiveOrOption || undefined,
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
    validate: ({ options, ...values }) => {
      const errors: FormikErrors<FormikValues> = {};
      if (values.fn && !options?.some((option) => option.data.val)) {
        errors.fn =
          "At least one option must set a data value when the checklist has a data field";
      }
      return errors;
    },
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
    <form onSubmit={formik.handleSubmit} id="modal">
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
                required
              />

              <ImgInput
                img={formik.values.img}
                onChange={(newUrl) => {
                  formik.setFieldValue("img", newUrl);
                }}
              />
            </InputRow>

            <InputRow>
              <RichTextInput
                name="description"
                value={formik.values.description}
                placeholder="Description"
                onChange={formik.handleChange}
              />
            </InputRow>

            <InputRow>
              <Input
                format="data"
                name="fn"
                value={formik.values.fn}
                placeholder="Data Field"
                onChange={formik.handleChange}
                error={Boolean(formik.errors?.fn)}
                errorMessage={formik.errors?.fn}
              />
            </InputRow>
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
              />
            </InputRow>
          </InputGroup>
        </ModalSectionContent>

        <Options formik={formik} />
      </ModalSection>

      <ModalFooter formik={formik} />
    </form>
  );
};

export default ChecklistEditor;
