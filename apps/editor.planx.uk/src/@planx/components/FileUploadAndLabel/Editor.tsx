import RuleIcon from "@mui/icons-material/Rule";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import { getValidSchemaValues } from "@opensystemslab/planx-core";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import { getIn, useFormik } from "formik";
import { merge } from "lodash";
import React from "react";
import ImgInput from "ui/editor/ImgInput/ImgInput";
import ListManager, {
  EditorProps as ListManagerEditorProps,
} from "ui/editor/ListManager/ListManager";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import { ModalSubtitle } from "ui/editor/ModalSubtitle";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import { Switch } from "ui/shared/Switch";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";
import { RuleBuilder } from "../shared/RuleBuilder";
import { Condition } from "../shared/RuleBuilder/types";
import {
  FileType,
  FileUploadAndLabel,
  newFileType,
  parseContent,
} from "./model";
import { fileUploadAndLabelSchema } from "./schema";

type Props = EditorProps<TYPES.FileUploadAndLabel, FileUploadAndLabel>;

function FileUploadAndLabelComponent(props: Props) {
  const formik = useFormik<FileUploadAndLabel>({
    initialValues: parseContent(props.node?.data),
    validationSchema: fileUploadAndLabelSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.FileUploadAndLabel,
        data: newValues,
      });
    },
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
          title="Upload and label"
          Icon={ICONS[TYPES.FileUploadAndLabel]}
        >
          <InputRow>
            <Input
              errorMessage={formik.errors.title}
              format="large"
              name="title"
              placeholder={formik.values.title}
              value={formik.values.title}
              onChange={formik.handleChange}
              disabled={props.disabled}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              multiline
              name="description"
              placeholder="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.description}
            />
          </InputRow>
          <InputRow>
            <Switch
              checked={formik.values.hideDropZone}
              onChange={() =>
                formik.setFieldValue(
                  "hideDropZone",
                  !formik.values.hideDropZone,
                )
              }
              label="Hide the drop zone and show files list for information only"
              disabled={props.disabled}
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <ModalSection>
        <ModalSectionContent title="File types" Icon={RuleIcon}>
          <ListManager
            values={formik.values.fileTypes}
            onChange={(fileTypes) => {
              formik.setFieldValue("fileTypes", fileTypes);
            }}
            Editor={FileTypeEditor}
            newValue={newFileType}
            disabled={props.disabled}
            errors={formik.errors.fileTypes}
            collapsible={true}
          />
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
}

function FileTypeEditor(props: ListManagerEditorProps<FileType>) {
  // Rather than default to generic `useStore().getFlowSchema()`
  //   File Upload components can specifically suggest based on ODP Schema enum options
  const schema = getValidSchemaValues("FileType") || [];
  // Additionally ensure that existing initial values are supported & pre-populated on load
  if (props.value.fn && !schema?.includes(props.value.fn))
    schema.push(props.value.fn);

  return (
    <Box sx={{ flex: 1 }} data-testid="rule-list-manager">
      <InputRow>
        <Input
          errorMessage={getIn(props.errors, "title")}
          name="name"
          value={props.value.name}
          onChange={(e) =>
            props.onChange(merge(props.value, { name: e.target.value }))
          }
          placeholder="File type"
          disabled={props.disabled}
        />
      </InputRow>
      <Collapse in={!props.isCollapsed} timeout="auto">
        <DataFieldAutocomplete
          errorMessage={getIn(props.errors, "fn")}
          schema={schema}
          value={props.value.fn}
          disabled={props.disabled}
          onChange={(value) =>
            props.onChange(merge(props.value, { fn: value }))
          }
          allowCustomValues={false}
        />
        <RuleBuilder
          rule={props.value.rule}
          disabled={props.disabled}
          onChange={(rule) => props.onChange(merge(props.value, { rule }))}
          dataSchema={["recommended", "required"]}
        />
        <ModalSubtitle title="Additional file information" />
        <InputRow>
          <RichTextInput
            multiline
            name="info"
            value={props.value.moreInformation?.info}
            onChange={(e) => {
              props.onChange(
                merge(props.value, {
                  moreInformation: { info: e.target.value },
                }),
              );
            }}
            placeholder="Why it matters"
            disabled={props.disabled}
            errorMessage={getIn(props.errors, "moreInformation.info")}
          />
        </InputRow>
        <InputRow>
          <RichTextInput
            multiline
            name="policyRef"
            value={props.value.moreInformation?.policyRef}
            onChange={(e) => {
              props.onChange(
                merge(props.value, {
                  moreInformation: { policyRef: e.target.value },
                }),
              );
            }}
            placeholder="Policy source"
            disabled={props.disabled}
            errorMessage={getIn(props.errors, "moreInformation.policyRef")}
          />
        </InputRow>
        <InputRow>
          <RichTextInput
            multiline
            name="howMeasured"
            value={props.value.moreInformation?.howMeasured}
            onChange={(e) => {
              props.onChange(
                merge(props.value, {
                  moreInformation: { howMeasured: e.target.value },
                }),
              );
            }}
            placeholder="How is it defined?"
            disabled={props.disabled}
            errorMessage={getIn(props.errors, "moreInformation.howMeasured")}
          />
          <InputRowItem>
            <ImgInput
              img={props.value.moreInformation?.definitionImg}
              disabled={props.disabled}
              onChange={(newUrl) => {
                props.onChange(
                  merge(props.value, {
                    moreInformation: { definitionImg: newUrl ?? "" },
                  }),
                );
              }}
            />
          </InputRowItem>
        </InputRow>
      </Collapse>
    </Box>
  );
}

export default FileUploadAndLabelComponent;
