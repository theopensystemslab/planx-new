import { gql } from "graphql-request";
import * as jsondiffpatch from "jsondiffpatch";
import { $api } from "../../../../client/index.js";
import { getFlowData } from "../../../../helpers.js";
import type { Flow } from "../../../../types.js";
import { transformDeltaToTemplatedFlowEditsData } from "./helpers.js";

export const updateTemplatedFlowEdits = async (
  flowId: string,
  templatedFrom: string,
  data: Flow["data"],
) => {
  // We fetch the live source template data, not its' latest published version, so it's a comparable diff to live incoming data (eg 'unflattened')
  //  Alternatively may consider ShareDB 'fetchsnapshotbytimestamp' in future using last published timestamp, but currently no easy way to call from API
  const sourceTemplate = await getFlowData(templatedFrom);
  const sourceTemplateData = sourceTemplate?.data;
  if (!sourceTemplateData) return;

  // Because the templated flow only enables editing of nodes tagged "customisation" or their children,
  //   the delta by default will only ever include nodes we need to record in `templated_flow_edits`
  const delta = jsondiffpatch.diff(sourceTemplateData, data);
  if (!delta) return;

  // Compare the delta to incoming data and transform into shape we can store in `templated_flow_edits.data`
  const templatedFlowEditsData = transformDeltaToTemplatedFlowEditsData(
    delta,
    data,
  );

  const response = await $api.client.request<any>(
    gql`
      mutation UpsertTemplatedFlowEdits($flow_id: uuid!, $data: jsonb = {}) {
        insert_templated_flow_edits_one(
          object: { flow_id: $flow_id, data: $data }
          on_conflict: {
            constraint: templated_flow_edits_flow_id_key
            update_columns: data
          }
        ) {
          id
          flow_id
          data
          created_at
          updated_at
        }
      }
    `,
    {
      flow_id: flowId,
      data: templatedFlowEditsData,
    },
  );

  return { flowId, delta, response };
};
