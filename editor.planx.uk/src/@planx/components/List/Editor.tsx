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
import { ResidentialUnits } from "./schemas/ResidentialUnits";
import { Zoo } from "./schemas/Zoo";

type Props = EditorProps<TYPES.List, List>;

export const SCHEMAS = [
  { name: "Residential Units (alpha)", schema: ResidentialUnits },
  { name: "Zoo (test)", schema: Zoo },
  // TODO: Residential units (GLA)
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
