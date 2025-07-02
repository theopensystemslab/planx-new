import RuleIcon from "@mui/icons-material/Rule";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { getValidSchemaValues } from "@opensystemslab/planx-core";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import { lowerCase, merge, upperFirst } from "lodash";
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
import SelectInput from "ui/editor/SelectInput/SelectInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import { Switch } from "ui/shared/Switch";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";
import {
  checkIfConditionalRule,
  Condition,
  FileType,
  FileUploadAndLabel,
  newFileType,
  Operator as OperatorEnum,
  parseContent,
  Rule,
} from "./model";
import { fileUploadAndLabelSchema } from "./schema";

type Props = EditorProps<TYPES.FileUploadAndLabel, FileUploadAndLabel>;

const Operator = styled(Typography)(({ theme }) => ({
  alignSelf: "center",
  padding: theme.spacing(0, 2),
}));

Operator.defaultProps = {
  variant: "body2",
};

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
              required
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
            isTemplatedNode={props.node?.data?.isTemplatedNode}
          />
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
}

function FileTypeEditor(props: ListManagerEditorProps<FileType>) {
  const isConditionalRule = checkIfConditionalRule(props.value.rule.condition);

  // Rather than default to generic `useStore().getFlowSchema()`
  //   File Upload components can specifically suggest based on ODP Schema enum options
  const schema = getValidSchemaValues("FileType") || [];
  // Additionally ensure that existing initial values are supported & pre-populated on load
  if (props.value.fn && !schema?.includes(props.value.fn))
    schema.push(props.value.fn);

  return (
    <Box sx={{ flex: 1, mb: 2 }} data-testid="rule-list-manager">
      <ModalSubtitle title="File" />
      <InputRow>
        <Input
          required
          name="name"
          value={props.value.name}
          onChange={(e) =>
            props.onChange(merge(props.value, { name: e.target.value }))
          }
          placeholder="File type"
          disabled={props.disabled}
        />
      </InputRow>
      <DataFieldAutocomplete
        required
        schema={schema}
        value={props.value.fn}
        disabled={props.disabled}
        onChange={(value) => props.onChange(merge(props.value, { fn: value }))}
      />
      <ModalSubtitle title="Rule" />
      <InputRow>
        <SelectInput
          value={props.value.rule.condition}
          disabled={props.disabled}
          onChange={(e) =>
            props.onChange(
              setCondition(
                Condition[e.target.value as keyof typeof Condition],
                props.value,
              ),
            )
          }
        >
          {Object.entries(Condition).map(([key, value]) => (
            <MenuItem key={key} value={value}>
              {upperFirst(lowerCase(value))}
            </MenuItem>
          ))}
        </SelectInput>
      </InputRow>
      {isConditionalRule && (
        <InputRow>
          <Input
            required
            name="fn"
            value={props.value.rule.fn}
            onChange={(e) =>
              props.onChange(
                merge(props.value, {
                  rule: {
                    fn: e.target.value,
                  },
                }),
              )
            }
            placeholder="Data field"
            disabled={props.disabled}
          />
          <Operator>Equals</Operator>
          <Input
            required
            name="val"
            value={props.value.rule.val}
            onChange={(e) =>
              props.onChange(
                merge(props.value, {
                  rule: {
                    val: e.target.value,
                  },
                }),
              )
            }
            placeholder="Value"
            disabled={props.disabled}
          />
        </InputRow>
      )}
      <ModalSubtitle title="Additional file information" />
      <InputRow>
        <RichTextInput
          multiline
          name="info"
          value={props.value.moreInformation?.info}
          onChange={(e) => {
            props.onChange(
              merge(props.value, { moreInformation: { info: e.target.value } }),
            );
          }}
          placeholder="Why it matters"
          disabled={props.disabled}
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
        />
        <InputRowItem width={50}>
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
    </Box>
  );
}

const setCondition = (condition: Condition, fileType: FileType): FileType => {
  const isConditionalRule = checkIfConditionalRule(condition);

  // Drop fields which are only required for ConditionalRules
  const updatedRule = {
    condition: condition,
    operator: isConditionalRule ? OperatorEnum.Equals : undefined,
    fn: isConditionalRule ? fileType.rule.fn : undefined,
    val: isConditionalRule ? fileType.rule.val : undefined,
  } as Rule;

  const updateFileType: FileType = {
    ...fileType,
    rule: updatedRule,
  };

  return updateFileType;
};

export default FileUploadAndLabelComponent;
