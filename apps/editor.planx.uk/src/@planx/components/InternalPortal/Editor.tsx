import MenuItem from "@mui/material/MenuItem";
import {
  ComponentType as TYPES,
  NodeId,
} from "@opensystemslab/planx-core/types";
import { useFormikWithRef } from "@planx/components/shared/useFormikWithRef";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import InputLabel from "ui/public/InputLabel";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import SelectInput from "ui/shared/SelectInput/SelectInput";

import { ICONS } from "../shared/icons";
import { EditorProps } from "../shared/types";
import {
  Flow,
  InternalPortal,
  parseInternalPortal,
  validationSchema,
} from "./model";

type ExtraProps = {
  flows?: Flow[];
};

type CreateNewPortalArgs = { type: TYPES; data: InternalPortal };
type ReferToExistingPortalArgs = NodeId;

export type Props = EditorProps<
  TYPES.InternalPortal,
  InternalPortal,
  ExtraProps
> & {
  handleSubmit?: (
    data: CreateNewPortalArgs | ReferToExistingPortalArgs,
  ) => void;
};

const InternalPortalForm: React.FC<Props> = (props) => {
  const formik = useFormikWithRef<InternalPortal>(
    {
      initialValues: parseInternalPortal(props.node?.data),
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
          : { type: TYPES.InternalPortal, data: values };
        if (props.handleSubmit) {
          props.handleSubmit(payload);
        } else {
          alert(JSON.stringify(payload, null, 2));
        }
      },
      validationSchema,
    },
    props.formikRef,
  );

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
        <ModalSectionContent title="Folder" Icon={ICONS[TYPES.InternalPortal]}>
          <ErrorWrapper error={formik.errors.text}>
            <Input
              name="text"
              onChange={formik.handleChange}
              placeholder="Enter a folder name"
              rows={2}
              value={formik.values.text}
              disabled={props.disabled || !!formik.values.flowId}
              id="portalFlowId"
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

export default InternalPortalForm;
