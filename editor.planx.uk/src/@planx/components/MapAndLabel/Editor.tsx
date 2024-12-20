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
import SelectInput from "ui/editor/SelectInput/SelectInput";
import InputLabel from "ui/public/InputLabel";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";
import BasicRadio from "../shared/Radio/BasicRadio";
import { EditorProps } from "../shared/types";
import { MapAndLabel, parseContent } from "./model";
import { Trees } from "./schemas/Trees";

type Props = EditorProps<TYPES.MapAndLabel, MapAndLabel>;

export const SCHEMAS = [{ name: "Trees", schema: Trees }];

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
            <DataFieldAutocomplete
              required
              value={formik.values.fn}
              onChange={(value) => formik.setFieldValue("fn", value)}
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
                        title={type.title}
                        variant="compact"
                        value={type.id}
                        onChange={(e: React.SyntheticEvent<Element, Event>) => {
                          const target = e?.target as HTMLInputElement;
                          formik.setFieldValue("basemap", target.value);
                        }}
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
      <ModalFooter formik={formik} />
    </form>
  );
}
