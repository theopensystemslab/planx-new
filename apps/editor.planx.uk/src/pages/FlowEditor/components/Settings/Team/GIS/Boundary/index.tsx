import { convertToBoundingBox } from "lib/gis";
import { getEntity } from "lib/planningData/requests";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import InputLabel from "ui/editor/InputLabel";
import Input from "ui/shared/Input/Input";

import SettingsFormContainer from "../../../shared/SettingsForm";
import { BoundaryDescription } from "./components/BoundaryDescription";
import { PreviewMap } from "./components/PreviewMap";
import { GET_TEAM_SETTINGS, UPDATE_TEAM_SETTINGS } from "./queries";
import { defaultValues, validationSchema } from "./schema";
import type {
  BoundaryFormValues,
  GetTeamSettingsData,
  UpdateTeamSettingsVariables,
} from "./types";

const Boundary: React.FC = () => {
  const [teamId, teamSlug] = useStore((state) => [
    state.teamId,
    state.teamSlug,
  ]);

  return (
    <SettingsFormContainer<
      GetTeamSettingsData,
      UpdateTeamSettingsVariables,
      BoundaryFormValues
    >
      query={GET_TEAM_SETTINGS}
      mutation={UPDATE_TEAM_SETTINGS}
      validationSchema={validationSchema}
      legend={"Boundary (bounding box)"}
      description={<BoundaryDescription />}
      getInitialValues={({ teams: [team] }) => ({
        boundaryUrl: team.settings.boundaryUrl || "",
        boundaryBBox: team.settings.boundaryBBox || undefined,
      })}
      defaultValues={defaultValues}
      queryVariables={{ slug: teamSlug }}
      getMutationVariables={async (values) => {
        const entityId = values.boundaryUrl.split("/").at(-1)!;
        const entity = await getEntity(entityId);
        const boundaryBBox = convertToBoundingBox(entity);

        return {
          teamId,
          settings: {
            boundary_url: values.boundaryUrl,
            boundary_bbox: boundaryBBox,
          },
        };
      }}
      onSuccess={(data, { setFieldValue }) => {
        const boundaryBBox = data?.teams[0].settings.boundaryBBox;
        setFieldValue("boundaryBBox", boundaryBBox);
      }}
    >
      {({ formik }) => (
        <>
          <InputLabel label="Boundary URL" htmlFor="boundaryUrl">
            <Input
              name="boundaryUrl"
              value={formik.values.boundaryUrl}
              errorMessage={formik.errors.boundaryUrl}
              onChange={(e) =>
                formik.setFieldValue("boundaryUrl", e.target.value)
              }
              id="boundaryUrl"
            />
          </InputLabel>
          <PreviewMap geojsonData={formik.values.boundaryBBox} />
        </>
      )}
    </SettingsFormContainer>
  );
};

export default Boundary;
