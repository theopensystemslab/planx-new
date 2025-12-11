import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import RadioGroup from "@mui/material/RadioGroup";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import ColorPicker from "ui/editor/ColorPicker/ColorPicker";
import InputGroup from "ui/editor/InputGroup";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import SelectInput from "ui/shared/SelectInput/SelectInput";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";
import BasicRadio from "../shared/Radio/BasicRadio/BasicRadio";
import { EditorProps } from "../shared/types";
import { MapAndLabel, parseContent, validationSchema } from "./model";
import { BreachLocations } from "./schemas/BreachLocations";
import { SketchPlanCA } from "./schemas/SketchPlanCA";
import { SketchPlanFullDescriptionCA } from "./schemas/SketchPlanFullDescriptionCA";
import { SketchPlanFullDescriptionTPO } from "./schemas/SketchPlanFullDescriptionTPO";
import { SketchPlanTPO } from "./schemas/SketchPlanTPO";

type Props = EditorProps<TYPES.MapAndLabel, MapAndLabel>;

export const SCHEMAS = [
  { name: "Sketch plan - Conservation areas", schema: SketchPlanCA },
  { name: "Sketch plan - TPO", schema: SketchPlanTPO },
  {
    name: "Sketch plan (full description) - Conservation areas",
    schema: SketchPlanFullDescriptionCA,
  },
  {
    name: "Sketch plan (full description) - TPO",
    schema: SketchPlanFullDescriptionTPO,
  },
  {
    name: "Report a Breach - breach locations",
    schema: BreachLocations,
  },
];

export default MapAndLabelComponent;

function MapAndLabelComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseContent(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.MapAndLabel,
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
                errorMessage={formik.errors.title}
                disabled={props.disabled}
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
            <DataFieldAutocomplete
              errorMessage={formik.errors.fn}
              value={formik.values.fn}
              onChange={(value) => formik.setFieldValue("fn", value)}
              disabled={props.disabled}
            />
          </InputGroup>
        </ModalSectionContent>
        <ModalSectionContent title="Map options">
          <InputGroup>
            <Box mb={2}>
              <FormControl component="fieldset">
                <InputLabel label="Basemap">
                  <RadioGroup
                    defaultValue="OSVectorTile"
                    value={formik.values.basemap}
                  >
                    {[
                      {
                        id: "OSVectorTile",
                        title: "Ordnance Survey Vector Tiles",
                      },
                      {
                        id: "MapboxSatellite",
                        title: "Mapbox Satellite imagery",
                      },
                    ].map((type) => (
                      <BasicRadio
                        key={type.id}
                        id={type.id}
                        label={type.title}
                        variant="compact"
                        value={type.id}
                        onChange={(e: React.SyntheticEvent<Element, Event>) => {
                          const target = e?.target as HTMLInputElement;
                          formik.setFieldValue("basemap", target.value);
                        }}
                        disabled={props.disabled}
                      />
                    ))}
                  </RadioGroup>
                </InputLabel>
              </FormControl>
            </Box>
            <Box mb={2}>
              <FormControl component="fieldset">
                <InputLabel label="Drawing type">
                  <RadioGroup
                    defaultValue="Polygon"
                    value={formik.values.drawType}
                  >
                    {[
                      { id: "Polygon", title: "Polygon" },
                      { id: "Point", title: "Point" },
                    ].map((type) => (
                      <BasicRadio
                        key={type.id}
                        id={type.id}
                        label={type.title}
                        variant="compact"
                        value={type.id}
                        onChange={(e: React.SyntheticEvent<Element, Event>) => {
                          const target = e?.target as HTMLInputElement;
                          formik.setFieldValue("drawType", target.value);
                        }}
                        disabled={props.disabled}
                      />
                    ))}
                  </RadioGroup>
                </InputLabel>
              </FormControl>
            </Box>
            <InputRow>
              <InputRowItem>
                <ColorPicker
                  label="Drawing colour"
                  color={formik.values.drawColor}
                  onChange={(color) => {
                    formik.setFieldValue("drawColor", color);
                  }}
                  errorMessage={formik.errors.drawColor}
                  disabled={props.disabled}
                />
              </InputRowItem>
            </InputRow>
          </InputGroup>
        </ModalSectionContent>
        <ModalSectionContent title="Schema">
          <InputRow>
            <InputRowItem>
              <SelectInput
                value={formik.values.schemaName}
                onChange={(e) => {
                  formik.setFieldValue("schemaName", e.target.value);
                  formik.setFieldValue(
                    "schema",
                    SCHEMAS.find(
                      ({ name }) => name === (e.target.value as string),
                    )?.schema,
                  );
                }}
                disabled={props.disabled}
              >
                {SCHEMAS.map(({ name }) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </SelectInput>
            </InputRowItem>
          </InputRow>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
}
