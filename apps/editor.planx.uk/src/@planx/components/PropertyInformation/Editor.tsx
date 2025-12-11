import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps } from "@planx/components/shared/types";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import { Switch } from "ui/shared/Switch";

import { ICONS } from "../shared/icons";
import { parseContent, PropertyInformation, validationSchema } from "./model";

type Props = EditorProps<TYPES.PropertyInformation, PropertyInformation>;

export default PropertyInformationComponent;

function PropertyInformationComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseContent(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.PropertyInformation,
        data: newValues,
      });
    },
    validationSchema: validationSchema,
    validateOnChange: false,
    validateOnBlur: false,
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
          title="Property information"
          Icon={ICONS[TYPES.PropertyInformation]}
        >
          <InputRow>
            <Input
              format="large"
              name="title"
              placeholder={formik.values.title}
              value={formik.values.title}
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.title}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
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
              checked={formik.values.showPropertyTypeOverride}
              onChange={() =>
                formik.setFieldValue(
                  "showPropertyTypeOverride",
                  !formik.values.showPropertyTypeOverride,
                )
              }
              label="Support property type"
              disabled={props.disabled}
            />
          </InputRow>
          <Typography variant="body2" sx={{ mt: 1 }}>
            When enabled, this component will display the property type with a
            'change' link to overwrite it. To support the property type, the{" "}
            <strong>Open Systems Lab - Property types</strong> flow must be
            nested immediately before this component.
          </Typography>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
}
