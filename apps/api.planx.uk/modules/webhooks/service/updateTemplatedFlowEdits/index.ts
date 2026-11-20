import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { gql } from "graphql-request";
import * as jsondiffpatch from "jsondiffpatch";

import { $api } from "../../../../client/index.js";
import { getMostRecentPublishedFlow } from "../../../../helpers.js";
import { sanitiseNotes } from "../../../../shared/dataMerged.js";
import { dataUnmerged } from "../../../../shared/dataUnmerged.js";
import type { Flow } from "../../../../types.js";
import { transformDeltaToTemplatedFlowEditsData } from "./helpers.js";

export const updateTemplatedFlowEdits = async (
  flowId: string,
  templatedFrom: string,
  data: Flow["data"],
) => {
  // We fetch the published version of the source template data and un-flatten it so it's comparable diff to live incoming data
  //  Alternatively may consider ShareDB 'fetchsnapshotbytimestamp' in future using last published timestamp then could skip `sanitiseNotes` step, but currently no easy way to call from API
  const lastPublishedSourceTemplate = (await getMostRecentPublishedFlow(
    templatedFrom,
  )) as FlowGraph;
  const sourceTemplateData = dataUnmerged(lastPublishedSourceTemplate);
  if (!sourceTemplateData) return;

  // `dataUnmerged` cannot restore notes that were sanitised on publish, so also strip them from data before diffing; notes are disabled in templated flows anyways
  const dataWithoutNotes = sanitiseNotes(data);

  // Because the templated flow only enables editing when a node or its' children has property `isTemplatedNode: true`,
  //   the delta by default will only ever include nodes we need to record in `templated_flow_edits`
  const delta = jsondiffpatch.diff(sourceTemplateData, dataWithoutNotes);
  if (!delta) return;

  // Compare the delta to incoming data and transform into shape we can store in `templated_flow_edits.data`
  const templatedFlowEditsData = transformDeltaToTemplatedFlowEditsData(
    delta,
    dataWithoutNotes,
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
