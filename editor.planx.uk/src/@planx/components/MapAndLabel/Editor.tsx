import ColorLensIcon from "@mui/icons-material/ColorLens";
import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import { getContrastRatio, useTheme } from "@mui/material/styles";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React, { useState } from "react";
import ColorPicker from "ui/editor/ColorPicker";
import InputGroup from "ui/editor/InputGroup";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import BasicRadio from "../shared/Radio/BasicRadio";
import { EditorProps, ICONS, InternalNotes, MoreInformation } from "../ui";
import { MapAndLabel, parseContent } from "./model";

type Props = EditorProps<TYPES.MapAndLabel, MapAndLabel>;

export default MapAndLabelComponent;

function MapAndLabelComponent(props: Props) {
  const theme = useTheme();

  const formik = useFormik({
    initialValues: parseContent(props.node?.data),
    validate: ({ lineColour }) => {
      const isContrastThresholdMet =
        getContrastRatio("#FFF", lineColour) > theme.palette.contrastThreshold;
      if (!isContrastThresholdMet) {
        return {
          lineColour:
            "Theme colour does not meet accessibility contrast requirements (3:1)",
        };
      }
    },
    onSubmit: (newValues) => {
      console.log({ onSubmit: props });
      props.handleSubmit?.({
        type: TYPES.MapAndLabel,
        data: newValues,
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent
          title="Map and label"
          Icon={ICONS[TYPES.MapAndLabel]}
        >
          <InputGroup>
            <InputRow>
              <Input
                format="large"
                name="title"
                placeholder={"Title"}
                value={formik.values.title}
                onChange={formik.handleChange}
                required
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
              <Input
                format="data"
                name="fn"
                placeholder={"Data Field"}
                value={formik.values.fn}
                onChange={formik.handleChange}
                required
              />
            </InputRow>
          </InputGroup>
        </ModalSectionContent>
        <ModalSectionContent title="Map Formatting">
          <InputGroup>
            <InputRow>
              <InputRowItem>
                <ColorPicker
                  label="Line Colour"
                  color={formik.values.lineColour}
                  onChange={(color) => {
                    formik.setFieldValue("lineColour", color);
                  }}
                  errorMessage={formik.errors.lineColour}
                />
              </InputRowItem>
            </InputRow>
          </InputGroup>
        </ModalSectionContent>
        <ModalSectionContent title="Map Drawing Type">
          <FormControl component="fieldset">
            <RadioGroup defaultValue="default" value={formik.values.drawType}>
              {[
                { id: "Polygon", title: "Polygon" },
                { id: "Point", title: "Point" },
              ].map((type) => (
                <BasicRadio
                  key={type.id}
                  id={type.id}
                  title={type.title}
                  variant="compact"
                  value={type.id}
                  onChange={(e: React.SyntheticEvent<Element, Event>) => {
                    const target = e?.target as HTMLInputElement;
                    formik.setFieldValue("drawType", target.value);
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>
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
