import { gql, useQuery } from "@apollo/client";
import MenuItem from "@mui/material/MenuItem";
import { useFormikContext } from "formik";
import React from "react";
import SelectInput from "ui/editor/SelectInput/SelectInput";
import InputLabel from "ui/public/InputLabel";

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

  return (
    <InputLabel label="Available flows" id="available-flow-select">
      <SelectInput
        value={values.flow.sourceId}
        name="mode"
        bordered
        required={true}
        title={"Available flows"}
        labelId="available-flow-select"
        onChange={(e) => setFieldValue("flow.sourceId", e.target.value)}
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
