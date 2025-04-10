import { gql, useQuery } from "@apollo/client";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";
import { useFormikContext } from "formik";
import React from "react";
import SelectInput from "ui/editor/SelectInput/SelectInput";
import InputLabel from "ui/public/InputLabel";
import { slugify } from "utils";

import { CreateFlow } from "./types";

export interface TemplateOption {
  name: string;
  slug: string;
  id: string;
}

export const CreateFromTemplateFormSection: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<CreateFlow>();

  const { data } = useQuery<{ templates: TemplateOption[] }>(gql`
    query GetTemplates {
      templates: flows(where: { is_template: { _eq: true } }) {
        id
        slug
        name
      }
    }
  `);

  if (values.mode !== "template" || !data?.templates?.length) return null;

  const handleChange = (e: SelectChangeEvent<unknown>) => {
    setFieldValue("flow.sourceId", e.target.value)

    const selectedTemplate = data.templates.find(({ id }) => id === e.target.value);
    if (!selectedTemplate) return;

    // Suggest a naming convention
    if (!values.flow.name.endsWith(" (template)")) {
      const newFlowName = `${selectedTemplate.name} (template)`;
      setFieldValue("flow.name", newFlowName)
      setFieldValue("flow.slug", slugify(newFlowName));
    }
  }

  return (
    <InputLabel label="Available templates" id="available-templates-select">
      <SelectInput
        value={values.flow.sourceId}
        name="mode"
        bordered
        required
        title={"Available templates"}
        labelId="available-templates-select"
        onChange={handleChange}
      >
        {data.templates.map(({ id, name }) => (
          <MenuItem key={id} value={id}>
            {name}
          </MenuItem>
        ))}
      </SelectInput>
    </InputLabel>
  );
};
