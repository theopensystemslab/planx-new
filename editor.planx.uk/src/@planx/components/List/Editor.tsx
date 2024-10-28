import MenuItem from "@mui/material/MenuItem";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import SelectInput from "ui/editor/SelectInput/SelectInput";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";

import { ICONS } from "../shared/icons";
import { EditorProps } from "../sharedTypes";
import { List, parseContent, validationSchema } from "./model";
import { ProposedAdvertisements } from "./schemas/Adverts";
import { NonResidentialFloorspace } from "./schemas/Floorspace";
import { BuildingDetailsGLA } from "./schemas/GLA/BuildingDetails";
import { CommunalSpaceGLA } from "./schemas/GLA/CommunalSpace";
import { ExistingAndProposedUsesGLA } from "./schemas/GLA/ExistingAndProposedUses";
import { OpenSpaceGLA } from "./schemas/GLA/OpenSpace";
import { ParkingGLA } from "./schemas/GLA/ParkingGLA";
import { ProtectedSpaceGLA } from "./schemas/GLA/ProtectedSpace";
import { MaterialDetails } from "./schemas/Materials";
import { Parking } from "./schemas/Parking";
import { ResidentialUnitsExisting } from "./schemas/ResidentialUnits/Existing";
import { ResidentialUnitsExistingLDCE } from "./schemas/ResidentialUnits/ExistingLDCE";
import { ResidentialUnitsGLAGained } from "./schemas/ResidentialUnits/GLA/Gained";
import { ResidentialUnitsGLALost } from "./schemas/ResidentialUnits/GLA/Lost";
import { ResidentialUnitsPreviousLDCE } from "./schemas/ResidentialUnits/PreviousLDCE";
import { ResidentialUnitsProposed } from "./schemas/ResidentialUnits/Proposed";
import { Trees } from "./schemas/Trees";
import { TreesMapFirst } from "./schemas/TreesMapFirst";

type Props = EditorProps<TYPES.List, List>;

export const SCHEMAS = [
  { name: "Residential units - Existing", schema: ResidentialUnitsExisting },
  {
    name: "Residential units (LDCE) - Existing",
    schema: ResidentialUnitsExistingLDCE,
  },
  { name: "Residential units - Proposed", schema: ResidentialUnitsProposed },
  {
    name: "Residential units (LDCE) - Previous",
    schema: ResidentialUnitsPreviousLDCE,
  },
  {
    name: "Residential units (GLA) - Lost",
    schema: ResidentialUnitsGLALost,
  },
  {
    name: "Residential units (GLA) - Gained",
    schema: ResidentialUnitsGLAGained,
  },
  { name: "Non-residential floorspace", schema: NonResidentialFloorspace },
  {
    name: "Existing and proposed uses (GLA)",
    schema: ExistingAndProposedUsesGLA,
  },
  { name: "Material details", schema: MaterialDetails },
  { name: "Building details (GLA)", schema: BuildingDetailsGLA },
  { name: "Communal spaces (GLA)", schema: CommunalSpaceGLA },
  { name: "Protected spaces (GLA)", schema: ProtectedSpaceGLA },
  { name: "Open spaces (GLA)", schema: OpenSpaceGLA },
  { name: "Proposed advertisements", schema: ProposedAdvertisements },
  { name: "Parking details", schema: Parking },
  { name: "Parking details (GLA)", schema: ParkingGLA },
  { name: "Trees", schema: Trees },
  { name: "Trees (Map first)", schema: TreesMapFirst },
];

function ListComponent(props: Props) {
  const formik = useFormik({
    initialValues: parseContent(props.node?.data),
    onSubmit: (newValues) => {
      props.handleSubmit?.({
        type: TYPES.List,
        data: newValues,
      });
    },
    validationSchema,
    validateOnChange: false,
  });

  return (
    <form onSubmit={formik.handleSubmit} id="modal">
      <ModalSection>
        <ModalSectionContent title="List" Icon={ICONS[TYPES.List]}>
          <InputRow>
            <Input
              format="large"
              name="title"
              value={formik.values.title}
              placeholder="Title"
              onChange={formik.handleChange}
              required
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
            />
          </InputRow>
          <InputRow>
            <Input
              format="data"
              name="fn"
              value={formik.values.fn}
              placeholder="Data Field"
              onChange={formik.handleChange}
              required
            />
          </InputRow>
          <ErrorWrapper error={formik.errors.schema?.max}>
            <InputRow>
              <InputRowLabel>Schema</InputRowLabel>
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
          </ErrorWrapper>
        </ModalSectionContent>
      </ModalSection>
      <ModalFooter formik={formik} />
    </form>
  );
}

export default ListComponent;
