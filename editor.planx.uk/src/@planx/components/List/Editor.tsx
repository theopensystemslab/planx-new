import MenuItem from "@mui/material/MenuItem";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useFormik } from "formik";
import React from "react";
import ModalSection from "ui/editor/ModalSection";
import ModalSectionContent from "ui/editor/ModalSectionContent";
import RichTextInput from "ui/editor/RichTextInput";
import SelectInput from "ui/editor/SelectInput";
import Input from "ui/shared/Input";
import InputRow from "ui/shared/InputRow";
import InputRowItem from "ui/shared/InputRowItem";
import InputRowLabel from "ui/shared/InputRowLabel";

import { EditorProps, ICONS, InternalNotes, MoreInformation } from "../ui";
import { List, parseContent } from "./model";
import { ResidentialUnitsExisting } from "./schemas/ResidentialUnits/Existing";
import { ResidentialUnitsProposed } from "./schemas/ResidentialUnits/Proposed";
// import { ResidentialUnitsGLANew } from "./schemas/ResidentialUnits/GLA/New";
// import { ResidentialUnitsGLARebuilt } from "./schemas/ResidentialUnits/GLA/Rebuilt";
// import { ResidentialUnitsGLARemoved } from "./schemas/ResidentialUnits/GLA/Removed";
// import { ResidentialUnitsGLARetained } from "./schemas/ResidentialUnits/GLA/Retained";
import { ResidentialUnitsGLAGained } from "./schemas/ResidentialUnits/GLA/Gained";
import { ResidentialUnitsGLALost } from "./schemas/ResidentialUnits/GLA/Lost";
import { ExistingAndProposedUsesGLA } from "./schemas/GLA/ExistingAndProposedUses";
import { CommunalSpaceGLA } from "./schemas/GLA/CommunalSpace";
import { Zoo } from "./schemas/Zoo";
import { ProposedAdvertisements } from "./schemas/Adverts";

type Props = EditorProps<TYPES.List, List>;

export const SCHEMAS = [
  { name: "Residential units - Existing", schema: ResidentialUnitsExisting },
  { name: "Residential units - Proposed", schema: ResidentialUnitsProposed },
  { name: "Residential units (GLA) - Gained", schema: ResidentialUnitsGLAGained },
  { name: "Residential units (GLA) - Lost", schema: ResidentialUnitsGLALost },
  { name: "Existing and proposed uses (GLA)", schema: ExistingAndProposedUsesGLA },
  { name: "Communal spaces", schema: CommunalSpaceGLA },
//  { name: "Residential units (GLA) - New", schema: ResidentialUnitsGLANew },
//  {
//    name: "Residential units (GLA) - Rebuilt",
//    schema: ResidentialUnitsGLARebuilt,
//  },
//  {
//    name: "Residentail units (GLA) - Removed",
//    schema: ResidentialUnitsGLARemoved,
//  },
//  {
//    name: "Residential units (GLA) - Retained",
//    schema: ResidentialUnitsGLARetained,
//  },
  { name: "Zoo (test)", schema: Zoo },
  { name: "Proposed advertisements", schema: ProposedAdvertisements },
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

export default ListComponent;
