import RuleIcon from "@mui/icons-material/Rule";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
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
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import { Switch } from "ui/shared/Switch";

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
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              multiline
              name="description"
              placeholder="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
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
          />
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} />
    </form>
  );
}

function FileTypeEditor(props: ListManagerEditorProps<FileType>) {
  const isConditionalRule = checkIfConditionalRule(props.value.rule.condition);

  return (
    <Box sx={{ flex: 1 }} data-testid="rule-list-manager">
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
        />
      </InputRow>
      <InputRow>
        <Input
          required
          name="fn"
          format="data"
          value={props.value.fn}
          onChange={(e) =>
            props.onChange(merge(props.value, { fn: e.target.value }))
          }
          placeholder="Data field"
        />
      </InputRow>
      <ModalSubtitle title="Rule" />
      <InputRow>
        <SelectInput
          value={props.value.rule.condition}
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
        />
        <InputRowItem width={50}>
          <ImgInput
            img={props.value.moreInformation?.definitionImg}
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
      <Divider sx={{ mb: 2, mt: 4 }} />
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
