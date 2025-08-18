import MenuItem from "@mui/material/MenuItem";
import {
  ComponentType as TYPES,
  NodeId,
} from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import SelectInput from "ui/editor/SelectInput/SelectInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";

import { ICONS } from "../shared/icons";
import { EditorProps } from "../shared/types";
import { Flow, Folder, parseFolder, validationSchema } from "./model";

type ExtraProps = {
  flows?: Flow[];
};

type CreateNewFolderArgs = { type: TYPES; data: Folder };
type ReferToExistingFolderArgs = NodeId;

export type Props = EditorProps<TYPES.Folder, Folder, ExtraProps> & {
  handleSubmit?: (
    data: CreateNewFolderArgs | ReferToExistingFolderArgs,
  ) => void;
};

const FolderForm: React.FC<Props> = (props) => {
  const formik = useFormik<Folder>({
    initialValues: parseFolder(props.node?.data),
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.flowId && !values.text) {
        errors.text =
          props.flows?.length && props.flows?.length > 0
            ? "Enter a folder name or select an existing folder"
            : "Enter a folder name";
      }
      return errors;
    },
    onSubmit: (values) => {
      const payload = values.flowId
        ? values.flowId
        : { type: TYPES.Folder, data: values };
      if (props.handleSubmit) {
        props.handleSubmit(payload);
      } else {
        alert(JSON.stringify(payload, null, 2));
      }
    },
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
  });

  return (
    <form id="modal" onSubmit={formik.handleSubmit} data-testid="form">
      <TemplatedNodeInstructions
        isTemplatedNode={formik.values.isTemplatedNode}
        templatedNodeInstructions={formik.values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          formik.values.areTemplatedNodeInstructionsRequired
        }
      />
      <ModalSection>
        <ModalSectionContent title="Folder" Icon={ICONS[TYPES.Folder]}>
          <ErrorWrapper error={formik.errors.text}>
            <Input
              name="text"
              onChange={formik.handleChange}
              placeholder="Enter a folder name"
              rows={2}
              value={formik.values.text}
              disabled={props.disabled || !!formik.values.flowId}
              id="folderFlowId"
            />
          </ErrorWrapper>
        </ModalSectionContent>
        {props.flows && props.flows?.length > 0 && (
          <ModalSectionContent subtitle="Select an existing folder">
            <InputLabel
              label="Select an existing folder"
              id="flowId-label"
              hidden
              htmlFor="flowId"
            />
            <SelectInput
              aria-describedby="flowId"
              labelId="flowId-label"
              id="flowId"
              data-testid="flowId"
              name="flowId"
              value={formik.values.flowId}
              onChange={formik.handleChange}
              disabled={props.disabled || !!formik.values.text}
            >
              {props.flows?.map((flow) => (
                <MenuItem key={flow.id} value={flow.id}>
                  {flow.text}
                </MenuItem>
              ))}
            </SelectInput>
          </ModalSectionContent>
        )}
      </ModalSection>
      <ModalFooter
        formik={formik}
        showMoreInformation={false}
        disabled={props.disabled}
      />
    </form>
  );
};

export default FolderForm;
