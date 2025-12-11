import { gql, useQuery } from "@apollo/client";
import MenuItem from "@mui/material/MenuItem";
import { SelectChangeEvent } from "@mui/material/Select";
import { useFormikContext } from "formik";
import React from "react";
import InputLabel from "ui/public/InputLabel";
import SelectInput from "ui/shared/SelectInput/SelectInput";
import { slugify } from "utils";

import { CreateFlow } from "./types";

interface CopiableFlow {
  id: string;
  slug: string;
  name: string;
  team: { name: string };
}

export const CreateFromCopyFormSection: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<CreateFlow>();

  const { data } = useQuery<{ copiableFlows: CopiableFlow[] }>(gql`
    query GetCopiableFlows {
      copiableFlows: flows(
        where: { can_create_from_copy: { _eq: true } }
        order_by: { team: { name: asc }, name: asc }
      ) {
        id
        slug
        name
        team {
          name
        }
      }
    }
  `);

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
