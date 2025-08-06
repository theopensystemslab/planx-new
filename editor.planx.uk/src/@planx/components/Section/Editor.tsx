import MoreTimeIcon from "@mui/icons-material/MoreTime";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import SelectInput from "ui/editor/SelectInput/SelectInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";

import { ICONS } from "../shared/icons";
import { parseSection, Section, SECTION_SIZE, validationSchema } from "./model";

type Props = EditorProps<TYPES.Section, Section>;

export default SectionComponent;

function SectionComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseSection(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.Section,
        data: newValues,
      });
    },
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
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
        <ModalSectionContent title="Section marker" Icon={ICONS[TYPES.Section]}>
          <InputRow>
            <Input
              required
              format="large"
              name="title"
              placeholder="Title"
              value={formik.values.title}
              onChange={formik.handleChange}
              disabled={props.disabled}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Short section description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              disabled={props.disabled}
              variant="paragraphContent"
              errorMessage={formik.errors.description}
            />
          </InputRow>
        </ModalSectionContent>
        <ModalSectionContent title="Section size" Icon={MoreTimeIcon}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Please estimate the relative size (length) of this section. This
            will be used to calculate a user's progress through your service.
          </Typography>
          <InputLabel label="Size" />
          <SelectInput
            name="size"
            value={formik.values.size}
            onChange={formik.handleChange}
            disabled={props.disabled}
          >
            {SECTION_SIZE.map((size) => (
              <MenuItem
                key={size}
                value={size}
                sx={{ textTransform: "capitalize" }}
              >
                {size}
              </MenuItem>
            ))}
          </SelectInput>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter
        formik={formik}
        showMoreInformation={false}
        disabled={props.disabled}
      />
    </form>
  );
}
