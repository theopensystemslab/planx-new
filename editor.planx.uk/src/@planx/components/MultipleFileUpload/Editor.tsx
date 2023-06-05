import RuleIcon from "@mui/icons-material/Rule";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import MenuItem from "@mui/material/MenuItem";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { TYPES } from "@planx/components/types";
import {
  EditorProps,
  ICONS,
  InternalNotes,
  MoreInformation,
} from "@planx/components/ui";
import { useFormik } from "formik";
import { capitalize, merge } from "lodash";
import React from "react";
import Input from "ui/Input";
import InputRow from "ui/InputRow";
import InputRowItem from "ui/InputRowItem";
import ListManager, {
  EditorProps as ListManagerEditorProps,
} from "ui/ListManager";
import ModalSection from "ui/ModalSection";
import ModalSectionContent from "ui/ModalSectionContent";
import { ModalSubtitle } from "ui/ModalSubtitle";
import PublicFileUploadButton from "ui/PublicFileUploadButton";
import RichTextInput from "ui/RichTextInput";
import SelectInput from "ui/SelectInput";

import {
  checkIfConditionalRule,
  Condition,
  FileType,
  MultipleFileUpload,
  newFileType,
  Operator as OperatorEnum,
  parseContent,
  Rule,
} from "./model";
import { multipleFileUploadSchema } from "./schema";

type Props = EditorProps<TYPES.MultipleFileUpload, MultipleFileUpload>;

const Operator = styled(Typography)(({ theme }) => ({
  alignSelf: "center",
  padding: theme.spacing(0, 2),
}));

Operator.defaultProps = {
  variant: "body2",
};

function MultipleFileUploadComponent(props: Props) {
  const formik = useFormik<MultipleFileUpload>({
    initialValues: {
      ...parseContent(props.node?.data),
    },
    validationSchema: multipleFileUploadSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.MultipleFileUpload,
        data: newValues,
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title="Multiple file upload"
          Icon={ICONS[TYPES.MultipleFileUpload]}
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
      <MoreInformation
        changeField={formik.handleChange}
        definitionImg={formik.values.definitionImg}
        howMeasured={formik.values.howMeasured}
        policyRef={formik.values.policyRef}
        info={formik.values.info}
      />
      <InternalNotes
        name="notes"
        value={formik.values.notes}
        onChange={formik.handleChange}
      />
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
          name="key"
          value={props.value.key}
          onChange={(e) =>
            props.onChange(merge(props.value, { key: e.target.value }))
          }
          placeholder="File type"
        />
      </InputRow>
      <InputRow>
        <Input
          required
          name="fn"
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
                props.value
              )
            )
          }
        >
          {Object.entries(Condition).map(([key, value]) => (
            <MenuItem key={key} value={value}>
              {capitalize(value)}
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
                })
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
                })
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
              merge(props.value, { moreInformation: { info: e.target.value } })
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
              })
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
              })
            );
          }}
          placeholder="How is it defined?"
        />
        <InputRowItem width={50}>
          <PublicFileUploadButton />
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

export default MultipleFileUploadComponent;
