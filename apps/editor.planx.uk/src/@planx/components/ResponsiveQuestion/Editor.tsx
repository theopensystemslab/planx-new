import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import ImgInput from "ui/editor/ImgInput/ImgInput";
import InputGroup from "ui/editor/InputGroup";
import ListManager from "ui/editor/ListManager/ListManager";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";
import { EditorProps } from "../shared/types";
import { getOptionsSchemaByFn } from "../shared/utils";
import {
  parseResponsiveQuestion,
  ResponsiveQuestion,
  validationSchema,
} from "./model";
import ResponsiveQuestionEditor from "./ResponsiveQuestionEditor";

type Props = EditorProps<TYPES.ResponsiveQuestion, ResponsiveQuestion>;

function ResponsiveQuestionComponent(props: Props) {
  const type = TYPES.ResponsiveQuestion;

  const formik = useFormik<ResponsiveQuestion>({
    initialValues: parseResponsiveQuestion(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.ResponsiveQuestion,
        data: newValues,
      });
    },
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
  });

  const schema = useStore((state) => state.getFlowSchema());
  const currentOptionVals = formik.values.options?.map(
    (option) => option.data?.val,
  );

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="Responsive question" Icon={ICONS[type]}>
          <InputGroup>
            <InputRow>
              <Input
                format="large"
                name="text"
                value={formik.values.text}
                placeholder="Text"
                onChange={formik.handleChange}
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
      </ModalSection>
      <ModalSectionContent subtitle="Options">
        <ListManager
          values={formik.values.options}
          onChange={(newOptions) => {
            formik.setFieldValue("options", newOptions);
          }}
          disabled={props.disabled}
          newValueLabel="add new option"
          newValue={() => ({
            id: "",
            data: {
              text: "",
              description: "",
              val: "",
              flags: [],
            },
          })}
          Editor={ResponsiveQuestionEditor}
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
      </ModalSectionContent>
      <ModalFooter formik={formik} showMoreInformation={false} />
    </form>
  );
}

export default ResponsiveQuestionComponent;
