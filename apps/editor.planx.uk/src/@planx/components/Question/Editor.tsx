import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { FormikErrors, FormikValues, getIn, useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useRef } from "react";
import { ComponentTagSelect } from "ui/editor/ComponentTagSelect";
import ImgInput from "ui/editor/ImgInput/ImgInput";
import InputGroup from "ui/editor/InputGroup";
import ListManager from "ui/editor/ListManager/ListManager";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeConfiguration } from "ui/editor/TemplatedNodeConfiguration";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { InternalNotes } from "../../../ui/editor/InternalNotes";
import { MoreInformation } from "../../../ui/editor/MoreInformation/MoreInformation";
import { parseBaseNodeData } from "../shared";
import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";
import { EditorProps } from "../shared/types";
import { getOptionsSchemaByFn } from "../shared/utils";
import { EditorQuestion, Question, validationSchema } from "./model";
import QuestionOptionsEditor from "./OptionsEditor";

type Props = EditorProps<TYPES.Question, Question>;

export const QuestionComponent: React.FC<Props> = (props) => {
  const type = TYPES.Question;

  const formik = useFormik<EditorQuestion>({
    initialValues: {
      description: props.node?.data?.description || "",
      fn: props.node?.data?.fn || "",
      img: props.node?.data?.img || "",
      options: props.node?.data?.options || [],
      text: props.node?.data?.text || "",
      neverAutoAnswer: props.node?.data?.neverAutoAnswer || false,
      alwaysAutoAnswerBlank: props.node?.data?.alwaysAutoAnswerBlank || false,
      ...parseBaseNodeData(props.node?.data),
    },
    onSubmit: ({ options, ...values }) => {
      const children = options
        .filter((o) => o.data.text)
        .map((o) => ({
          id: o.id || undefined,
          type: TYPES.Answer as const,
          data: o.data,
        }));

      if (props.handleSubmit) {
        props.handleSubmit({ type, data: values }, children);
      } else {
        alert(JSON.stringify({ type, ...values, children }, null, 2));
      }
    },
    validate: ({ options, ...values }) => {
      const errors: FormikErrors<FormikValues> = {};
      if (values.fn && !options.some((option) => option.data.val)) {
        errors.fn = "At least one option must also set a data field";
      }
      if (values.alwaysAutoAnswerBlank && !values.fn) {
        errors.alwaysAutoAnswerBlank =
          "Set a data field for the Question and all options but one when never putting to user";
      }
      if (
        values.alwaysAutoAnswerBlank &&
        values.fn &&
        options.filter((option) => !option.data.val).length !== 1
      ) {
        errors.alwaysAutoAnswerBlank =
          "Exactly one option should have a blank data field when never putting to user";
      }
      return errors;
    },
    validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
  });

  const schema = useStore().getFlowSchema();
  const currentOptionVals = formik.values.options?.map(
    (option) => option.data?.val,
  );

  const focusRef = useRef<HTMLInputElement | null>(null);

  const isTemplate = useStore.getState().isTemplate;

  return (
    <form
      onSubmit={formik.handleSubmit}
      id="modal"
      data-testid="question-component-form"
    >
      <TemplatedNodeInstructions
        isTemplatedNode={formik.values.isTemplatedNode}
        templatedNodeInstructions={formik.values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          formik.values.areTemplatedNodeInstructionsRequired
        }
      />
      <ModalSection>
        <ModalSectionContent title="Question" Icon={ICONS[type]}>
          <InputGroup>
            <InputRow>
              <Input
                format="large"
                name="text"
                value={formik.values.text}
                placeholder="Text"
                onChange={formik.handleChange}
                inputRef={focusRef}
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
                schema={schema?.nodes}
                value={formik.values.fn}
                onChange={(value) => formik.setFieldValue("fn", value)}
                disabled={props.disabled}
              />
            </ErrorWrapper>
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
        <ModalSectionContent subtitle="Options">
          <ErrorWrapper error={getIn(formik.errors, "options")}>
            <ListManager
              values={formik.values.options}
              disabled={props.disabled}
              onChange={(newOptions) => {
                formik.setFieldValue("options", newOptions);
              }}
              newValue={() => ({
                id: "",
                data: {
                  text: "",
                  description: "",
                  val: "",
                  flags: [],
                },
              })}
              Editor={QuestionOptionsEditor}
              editorExtraProps={{
                showValueField: !!formik.values.fn,
                schema: getOptionsSchemaByFn(
                  formik.values.fn,
                  schema?.options,
                  currentOptionVals,
                ),
              }}
              isTemplatedNode={props.node?.data?.isTemplatedNode}
            />
          </ErrorWrapper>
        </ModalSectionContent>
      </ModalSection>
      <MoreInformation formik={formik} disabled={props.disabled} />
      <InternalNotes
        name="notes"
        onChange={formik.handleChange}
        value={formik.values.notes}
        disabled={props.disabled}
      />
      <ComponentTagSelect
        value={formik.values.tags}
        onChange={(value) => formik.setFieldValue("tags", value)}
        disabled={props.disabled}
      />
      {isTemplate && (
        <TemplatedNodeConfiguration
          formik={formik}
          isTemplatedNode={formik.values.isTemplatedNode}
          templatedNodeInstructions={formik.values.templatedNodeInstructions}
          areTemplatedNodeInstructionsRequired={
            formik.values.areTemplatedNodeInstructionsRequired
          }
          disabled={props.disabled}
        />
      )}
    </form>
  );
};

export default QuestionComponent;
