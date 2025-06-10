import StarIcon from "@mui/icons-material/Star";
import Typography from "@mui/material/Typography";
import type { TemplatedNodeData } from "@opensystemslab/planx-core/types";
import { BaseNodeData } from "@planx/components/shared";
import { useFormik } from "formik";
import React from "react";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import InputGroup from "./InputGroup";
import InputLabel from "./InputLabel";
import ModalSection from "./ModalSection";
import ModalSectionContent from "./ModalSectionContent";

export type TemplatedNodeConfigurationProps<T extends BaseNodeData> = {
  formik: ReturnType<typeof useFormik<T>>;
  disabled?: boolean;
} & TemplatedNodeData;

export const TemplatedNodeConfiguration = <T extends BaseNodeData>({
  formik,
  isTemplatedNode,
  templatedNodeInstructions,
  areTemplatedNodeInstructionsRequired,
  disabled,
}: TemplatedNodeConfigurationProps<T>) => {
  return (
    <ModalSection>
      <ModalSectionContent title="Templates" Icon={StarIcon}>
        <Typography variant="body2" mb={2}>
          This node is in a source template. Configure how it should behave in
          templated flows.
        </Typography>
        <InputGroup flowSpacing>
          <InputRow>
            <Switch
              checked={isTemplatedNode}
              onChange={() =>
                formik.setFieldValue("isTemplatedNode", !isTemplatedNode)
              }
              label="Allow edits"
              disabled={disabled}
            />
          </InputRow>
          {isTemplatedNode && (
            <>
              <InputRow>
                <InputLabel
                  label="Instructions"
                  htmlFor="templatedNodeInstructions"
                >
                  <Input
                    name="templatedNodeInstructions"
                    id="templatedNodeInstructions"
                    value={templatedNodeInstructions}
                    onChange={formik.handleChange}
                    disabled={disabled}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </InputLabel>
              </InputRow>
              <InputRow>
                <Switch
                  checked={areTemplatedNodeInstructionsRequired}
                  onChange={() =>
                    formik.setFieldValue(
                      "areTemplatedNodeInstructionsRequired",
                      !areTemplatedNodeInstructionsRequired,
                    )
                  }
                  label="Require edits"
                  disabled={disabled}
                />
              </InputRow>
            </>
          )}
        </InputGroup>
      </ModalSectionContent>
    </ModalSection>
  );
};
