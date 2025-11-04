import MenuItem from "@mui/material/MenuItem";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import { ModalFooter } from "ui/editor/ModalFooter";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";
import { TemplatedNodeInstructions } from "ui/editor/TemplatedNodeInstructions";
import ErrorWrapper from "ui/shared/ErrorWrapper";
import Input from "ui/shared/Input/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";
import SelectInput from "ui/shared/SelectInput/SelectInput";

import { DataFieldAutocomplete } from "../shared/DataFieldAutocomplete";
import { ICONS } from "../shared/icons";
import { EditorProps } from "../shared/types";
import { List, parseContent, validationSchema } from "./model";
import { ProposedAdvertisements } from "./schemas/Adverts";
import { AmendDocuments } from "./schemas/AmendDocuments";
import { ExistingBuildingsCIL } from "./schemas/CIL/ExistingCIL";
import { MezzanineCIL } from "./schemas/CIL/MezzanineCIL";
import { UnoccupiedBuildingsCIL } from "./schemas/CIL/UnoccupiedCIL";
import { DescribeDocuments } from "./schemas/DescribeDocuments";
import { DischargeConditions } from "./schemas/DischargeConditions";
import { NonResidentialFloorspace } from "./schemas/Floorspace";
import { BuildingDetailsGLA } from "./schemas/GLA/BuildingDetails";
import { CommunalSpaceGLA } from "./schemas/GLA/CommunalSpace";
import { ExistingAndProposedUsesGLA } from "./schemas/GLA/ExistingAndProposedUses";
import { OpenSpaceGLA } from "./schemas/GLA/OpenSpace";
import { ParkingGLA } from "./schemas/GLA/ParkingGLA";
import { ProtectedSpaceGLA } from "./schemas/GLA/ProtectedSpace";
import { InterestInLandLDC } from "./schemas/InterestInLandLDC";
import { MaterialDetails } from "./schemas/Materials";
import { MaterialDetailsLBC } from "./schemas/MaterialsLBC";
import { Zoo } from "./schemas/mocks/Zoo/schema";
import { OwnershipCertificateOwners } from "./schemas/OwnershipCertificateOwners";
import { Parking } from "./schemas/Parking";
import { ResidentialUnitsExisting } from "./schemas/ResidentialUnits/Existing";
import { ResidentialUnitsExistingLDCE } from "./schemas/ResidentialUnits/ExistingLDCE";
import { ResidentialUnitsGLAGained } from "./schemas/ResidentialUnits/GLA/Gained";
import { ResidentialUnitsGLALost } from "./schemas/ResidentialUnits/GLA/Lost";
import { ResidentialUnitsPreviousLDCE } from "./schemas/ResidentialUnits/PreviousLDCE";
import { ResidentialUnitsProposed } from "./schemas/ResidentialUnits/Proposed";
import { TreeDescriptionCA } from "./schemas/TreeDescriptionCA";
import { TreeDescriptionTPO } from "./schemas/TreeDescriptionTPO";
import { Trees } from "./schemas/Trees";

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
  { name: "Material details (LBC)", schema: MaterialDetailsLBC },
  { name: "Building details (GLA)", schema: BuildingDetailsGLA },
  { name: "Communal spaces (GLA)", schema: CommunalSpaceGLA },
  { name: "Protected spaces (GLA)", schema: ProtectedSpaceGLA },
  { name: "Open spaces (GLA)", schema: OpenSpaceGLA },
  { name: "Proposed advertisements", schema: ProposedAdvertisements },
  { name: "Parking details", schema: Parking },
  { name: "Parking details (GLA)", schema: ParkingGLA },
  { name: "Existing buildings (CIL)", schema: ExistingBuildingsCIL },
  { name: "Unoccupied buildings (CIL)", schema: UnoccupiedBuildingsCIL },
  { name: "Mezzanine floors (CIL)", schema: MezzanineCIL },
  { name: "Interest in land (LDC)", schema: InterestInLandLDC },
  {
    name: "Ownership certificate - Owners",
    schema: OwnershipCertificateOwners,
  },
  { name: "Amend documents", schema: AmendDocuments },
  { name: "Describe documents", schema: DescribeDocuments },
  { name: "Discharge conditions", schema: DischargeConditions },
  { name: "Tree description - Conservation Area", schema: TreeDescriptionCA },
  { name: "Tree description - TPO", schema: TreeDescriptionTPO },
];

function ListComponent(props: Props) {
  const formik = useFormik<List>({
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
      <TemplatedNodeInstructions
        isTemplatedNode={formik.values.isTemplatedNode}
        templatedNodeInstructions={formik.values.templatedNodeInstructions}
        areTemplatedNodeInstructionsRequired={
          formik.values.areTemplatedNodeInstructionsRequired
        }
      />
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
              disabled={props.disabled}
            />
          </InputRow>
          <InputRow>
            <RichTextInput
              placeholder="Description"
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              disabled={props.disabled}
              errorMessage={formik.errors.description}
            />
          </InputRow>
          <DataFieldAutocomplete
            required
            value={formik.values.fn}
            onChange={(value) => formik.setFieldValue("fn", value)}
            disabled={props.disabled}
          />
          <ErrorWrapper error={formik.errors.schema?.max}>
            <InputRow>
              <InputRowLabel>Schema</InputRowLabel>
              <InputRowItem>
                <SelectInput
                  value={formik.values.schemaName}
                  disabled={props.disabled}
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
      <ModalFooter formik={formik} disabled={props.disabled} />
    </form>
  );
}

export default ListComponent;
