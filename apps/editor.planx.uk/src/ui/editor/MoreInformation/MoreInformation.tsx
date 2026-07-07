import Help from "@mui/icons-material/Help";
import Box from "@mui/material/Box";
import type { BaseNodeData } from "@planx/components/shared";
import { getIn } from "formik";
import React from "react";
import ImgInput from "ui/editor/ImgInput/ImgInput";
import InputGroup from "ui/editor/InputGroup";
import InputLabel from "ui/editor/InputLabel";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";

import type { MoreInformationProps } from "./types";

export const MoreInformation = <T extends BaseNodeData>({
  formik,
  disabled,
}: MoreInformationProps<T>) => {
  return (
    <ModalSection>
      <ModalSectionContent title="More information" Icon={Help}>
        <InputGroup flowSpacing>
          <InputLabel label="Why it matters" htmlFor="info" id="info-label">
            <RichTextInput
              multiline
              name="info"
              id="info"
              value={formik.values.info}
              errorMessage={getIn(formik.errors, "info")}
              onChange={formik.handleChange}
              disabled={disabled}
              variant="nestedContent"
              inputProps={{ "aria-labelledby": "info-label" }}
            />
          </InputLabel>
          <InputLabel
            label="Policy source"
            htmlFor="policyRef"
            id="policyRef-label"
          >
            <RichTextInput
              multiline
              name="policyRef"
              id="policyRef"
              value={formik.values.policyRef}
              errorMessage={getIn(formik.errors, "policyRef")}
              onChange={formik.handleChange}
              disabled={disabled}
              variant="nestedContent"
              inputProps={{ "aria-labelledby": "policyRef-label" }}
            />
          </InputLabel>
          {/* ImgInput must be outside InputLabel: role="button" inside <label> = nested-interactive */}
          <Box
            sx={{
              display: "flex",
              gap: "5px",
              alignItems: "flex-end",
              width: "100%",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <InputLabel
                label="How it is defined?"
                htmlFor="howMeasured"
                id="howMeasured-label"
              >
                <RichTextInput
                  multiline
                  name="howMeasured"
                  id="howMeasured"
                  value={formik.values.howMeasured}
                  errorMessage={getIn(formik.errors, "howMeasured")}
                  onChange={formik.handleChange}
                  disabled={disabled}
                  variant="nestedContent"
                  inputProps={{ "aria-labelledby": "howMeasured-label" }}
                />
              </InputLabel>
            </Box>
            <ImgInput
              img={formik.values.definitionImg}
              onChange={(newUrl) => {
                formik.handleChange({
                  target: { name: "definitionImg", value: newUrl },
                });
              }}
              disabled={disabled}
            />
          </Box>
        </InputGroup>
      </ModalSectionContent>
    </ModalSection>
  );
};
