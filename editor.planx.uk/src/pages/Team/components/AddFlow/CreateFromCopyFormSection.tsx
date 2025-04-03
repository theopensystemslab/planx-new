import MenuItem from "@mui/material/MenuItem";
import { useFormikContext } from "formik";
import React from "react";
import SelectInput from "ui/editor/SelectInput/SelectInput";
import InputLabel from "ui/public/InputLabel";

import { CreateFlow } from "./types";

export const CreateFromCopyFormSection: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<CreateFlow>();

  if (values.mode !== "copy") return null;

  // TODO: Fetch data
  const copiableFlows: { id: string; flowName: string; teamName: string }[] =
    [];

  return (
    <InputLabel label="Available flows" id="available-flow-select">
      <SelectInput
        value={values.flow.sourceId}
        name="mode"
        bordered
        required={true}
        title={"Available flows"}
        labelId="available-flow-select"
        onChange={(e) => setFieldValue("flow.source.id", e.target.value)}
      >
        {copiableFlows.map(({ id, flowName, teamName }) => (
          <MenuItem key={id} value={id}>
            {`${teamName} - ${flowName}`}
          </MenuItem>
        ))}
      </SelectInput>
    </InputLabel>
  );
};
