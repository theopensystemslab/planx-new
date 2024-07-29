import FormControl from "@mui/material/FormControl";
import RadioGroup from "@mui/material/RadioGroup";
import { useTheme } from "@mui/material/styles";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import ColorPicker from "ui/editor/ColorPicker";
import InputGroup from "ui/editor/InputGroup";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput";
import InputLabel from "ui/public/InputLabel";
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
    onSubmit: (newValues) => {
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
        <ModalSectionContent title="Map formatting">
          <InputGroup>
            <InputRow>
              <InputRowItem>
                <ColorPicker
                  label="Drawing Colour"
                  inline={false}
                  color={formik.values.drawColour}
                  onChange={(color) => {
                    formik.setFieldValue("drawColour", color);
                  }}
                  errorMessage={formik.errors.drawColour}
                />
              </InputRowItem>
            </InputRow>
          </InputGroup>
        </ModalSectionContent>
        <ModalSectionContent>
          <FormControl component="fieldset">
            <InputLabel label="Map drawing type">
              <RadioGroup defaultValue="Polygon" value={formik.values.drawType}>
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
            </InputLabel>
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
