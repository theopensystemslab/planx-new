import MenuItem from "@mui/material/MenuItem";
import { useFormikContext } from "formik";
import React from "react";
import SelectInput from "ui/editor/SelectInput/SelectInput";
import InputLabel from "ui/public/InputLabel";

import { CreateFlow } from "./types";

export const CreateFromTemplateFormSection: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<CreateFlow>();

  if (values.mode !== "template") return null;

  // TODO: Fetch data
  const templateForms: { id: string; flowName: string; teamName: string }[] =
    [];

  return (
    <InputLabel label="Available templates" id="available-templates-select">
      <SelectInput
        value={values.flow.sourceId}
        name="mode"
        bordered
        required={true}
        title={"Available templates"}
        labelId="available-templates-select"
        onChange={(e) => setFieldValue("flow.source.id", e.target.value)}
      >
        {templateForms.map(({ id, flowName, teamName }) => (
          <MenuItem key={id} value={id}>
            {`${teamName} - ${flowName}`}
          </MenuItem>
        ))}
      </SelectInput>
    </InputLabel>
  );
};
