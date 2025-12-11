import {
  ComponentType,
  ComponentType as TYPES,
} from "@opensystemslab/planx-core/types";
import QuestionOptionsEditor from "@planx/components/Question/OptionsEditor";
import { DEFAULT_RULE } from "@planx/components/ResponsiveQuestion/model";
import { getIn } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useRef } from "react";
import { ComponentTagSelect } from "ui/editor/ComponentTagSelect";
import ImgInput from "ui/editor/ImgInput/ImgInput";
import InputGroup from "ui/editor/InputGroup";
import ListManager from "ui/editor/ListManager/ListManager";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { InternalNotes } from "../../../../../ui/editor/InternalNotes";
import { DataFieldAutocomplete } from "../../DataFieldAutocomplete";
import { ICONS } from "../../icons";
import { getOptionsSchemaByFn } from "../../utils";
import MoreInformation from "./MoreInformation";
import TemplatedNodeConfiguration from "./TemplatedNodeConfiguration";
import { Props } from "./types";

/**
 * Shared editor component for Question and ResponsiveQuestion components
 * Renders shared UI across both types, and conditionally renders unique fields
 *
 * Uses custom components (MoreInformation, TemplateNodeConfiguration) for
 * type-narrowing. This passes either QuestionProps or ResponsiveQuestionProps
 * to children, not the QuestionProps | ResponsiveQuestionProps union
 */
const BaseQuestionComponent: React.FC<Props> = (props) => {
  const { type, formik } = props;

  const schema = useStore().getFlowSchema();
  const currentOptionVals = formik.values.options?.map(
    (option) => option.data?.val,
  );

  const focusRef = useRef<HTMLInputElement | null>(null);

  const isTemplate = useStore.getState().isTemplate;

  const title =
    type === ComponentType.Question ? "Question" : "Responsive question";

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
            {type === TYPES.Question && (
              <>
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
              </>
            )}
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
                  ...(type === ComponentType.ResponsiveQuestion && {
                    rule: DEFAULT_RULE,
                  }),
                },
              })}
              Editor={QuestionOptionsEditor}
              editorExtraProps={{
                type,
                showValueField: !!formik.values.fn,
                schema: getOptionsSchemaByFn(
                  formik.values.fn,
                  schema?.options,
                  currentOptionVals,
                ),
              }}
              isTemplatedNode={props.node?.data?.isTemplatedNode}
              collapsible={true}
              itemName="option"
            />
          </ErrorWrapper>
        </ModalSectionContent>
      </ModalSection>
      <MoreInformation {...props} />
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
      {isTemplate && <TemplatedNodeConfiguration {...props} />}
    </form>
  );
};

export default BaseQuestionComponent;
