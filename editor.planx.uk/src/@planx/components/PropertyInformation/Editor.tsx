import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { EditorProps, ICONS } from "@planx/components/ui";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";

import { parseContent, PropertyInformation } from "./model";

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
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
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
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              name="description"
              placeholder="Description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.showPropertyTypeOverride}
                  onChange={() =>
                    formik.setFieldValue(
                      "showPropertyTypeOverride",
                      !formik.values.showPropertyTypeOverride,
                    )
                  }
                />
              }
              label="Show users a 'change' link to override the property type"
            />
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} />
    </form>
  );
}
