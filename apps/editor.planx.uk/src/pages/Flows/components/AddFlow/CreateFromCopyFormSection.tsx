import MenuItem from "@mui/material/MenuItem";
import type { SelectChangeEvent } from "@mui/material/Select";
import { useFormikContext } from "formik";
import React from "react";
import InputLabel from "ui/public/InputLabel";
import SelectInput from "ui/shared/SelectInput/SelectInput";
import { slugify } from "utils";

import { useGetCopiableFlows } from "./hooks/useGetCopiableFlows";
import type { CreateFlow } from "./types";

export const CreateFromCopyFormSection: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<CreateFlow>();

  const { data } = useGetCopiableFlows();

  if (values.mode !== "copy" || !data?.copiableFlows?.length) return null;

  const handleChange = (e: SelectChangeEvent<unknown>) => {
    setFieldValue("flow.sourceId", e.target.value);

    const selectedFlow = data.copiableFlows.find(
      ({ id }) => id === e.target.value,
    );
    if (!selectedFlow) return;

    // Suggest a naming convention
    if (!/(copy|template)$/.test(values.flow.name)) {
      const newFlowName = `${selectedFlow.name} (copy)`;
      setFieldValue("flow.name", newFlowName);
      setFieldValue("flow.slug", slugify(newFlowName));
    }
  };

  return (
    <InputLabel label="Available flows" id="available-flow-select">
      <SelectInput
        value={values.flow.sourceId}
        name="mode"
        bordered
        required={true}
        title={"Available flows"}
        labelId="available-flow-select"
        onChange={handleChange}
      >
        {data.copiableFlows.map(({ id, name, team }) => (
          <MenuItem key={id} value={id}>
            {`${team.name} - ${name}`}
          </MenuItem>
        ))}
      </SelectInput>
    </InputLabel>
  );
};
