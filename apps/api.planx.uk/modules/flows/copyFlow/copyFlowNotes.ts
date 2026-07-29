import { gql } from "graphql-request";

import { getClient } from "../../../client/index.js";
import { renameNodeId } from "../../../helpers.js";
import type { Flow } from "../../../types.js";
import { userContext } from "../../auth/middleware.js";

interface NotePlacement {
  parent: string;
  container?: string;
  before?: string;
  parentIsContainer?: boolean;
}

interface FlowNotePositionRow {
  note_id: string;
  node_id: string | null;
  placement: NotePlacement | null;
  note: {
    text: string;
    color: string;
  };
}

const GET_FLOW_NOTES = gql`
  query GetFlowNotesForCopy($flowId: uuid!) {
    flow_note_positions(where: { flow_id: { _eq: $flowId } }) {
      note_id
      node_id
      placement
      note {
        text
        color
      }
    }
  }
`;

// Creates a new flow_note_content row alongside the first position, mirroring the "createFlowNote" pattern
const INSERT_FLOW_NOTE_POSITION_WITH_CONTENT = gql`
  mutation InsertFlowNotePositionWithContentForCopy(
    $object: flow_note_positions_insert_input!
  ) {
    insert_flow_note_positions_one(object: $object) {
      note_id
    }
  }
`;

// Points additional positions at an already-copied note, mirroring the "pasteFlowNoteClone" pattern
const INSERT_FLOW_NOTE_POSITIONS = gql`
  mutation InsertFlowNotePositionsForCopy(
    $objects: [flow_note_positions_insert_input!]!
  ) {
    insert_flow_note_positions(objects: $objects) {
      affected_rows
    }
  }
`;

const remapPlacement = (
  placement: NotePlacement,
  replaceValue: string,
): NotePlacement => ({
  ...placement,
  parent: renameNodeId(placement.parent, replaceValue),
  container: renameNodeId(placement.container, replaceValue) ?? undefined,
  before: renameNodeId(placement.before, replaceValue) ?? undefined,
});

const remapPosition = (
  { node_id, placement }: Pick<FlowNotePositionRow, "node_id" | "placement">,
  replaceValue: string,
) => ({
  node_id: renameNodeId(node_id, replaceValue),
  placement: placement ? remapPlacement(placement, replaceValue) : null,
});

/**
 * Copy a flow's notes to a newly-copied flow, remapping nodeIds/placements to match the destination flow's renamed nodes.
 * editing a note in the new flow instance will not affect the original flow's note
 *
 * notes that were clones of one another in the source flow are copied as clones of one another in the destination flow too
 * - they are just no longer clones of the original notes
 */
export const copyFlowNotes = async ({
  sourceFlowId,
  newFlowId,
  replaceValue,
}: {
  sourceFlowId: Flow["id"];
  newFlowId: Flow["id"];
  replaceValue: string;
}): Promise<void> => {
  const userId = userContext.getStore()?.user?.sub;
  if (!userId) return;

  const { client: $client } = getClient();

  const { flow_note_positions } = await $client.request<{
    flow_note_positions: FlowNotePositionRow[];
  }>(GET_FLOW_NOTES, { flowId: sourceFlowId });

  if (!flow_note_positions.length) return;

  const groupsByOriginalNoteId = new Map<string, FlowNotePositionRow[]>();
  for (const row of flow_note_positions) {
    const group = groupsByOriginalNoteId.get(row.note_id);
    if (group) group.push(row);
    else groupsByOriginalNoteId.set(row.note_id, [row]);
  }

  // One new flow_note_content row per unique original note, created via the first position that used it
  const newNoteIdByOriginalNoteId = new Map<string, string>();
  await Promise.all(
    Array.from(groupsByOriginalNoteId.entries()).map(
      async ([originalNoteId, [first]]) => {
        const { insert_flow_note_positions_one } = await $client.request<{
          insert_flow_note_positions_one: { note_id: string };
        }>(INSERT_FLOW_NOTE_POSITION_WITH_CONTENT, {
          object: {
            flow_id: newFlowId,
            ...remapPosition(first, replaceValue),
            created_by: userId,
            note: {
              data: {
                text: first.note.text,
                color: first.note.color,
                created_by: userId,
                updated_by: userId,
              },
            },
          },
        });
        newNoteIdByOriginalNoteId.set(
          originalNoteId,
          insert_flow_note_positions_one.note_id,
        );
      },
    ),
  );

  // Remaining positions in each group are clones - point them at the shared new note
  const cloneObjects = Array.from(groupsByOriginalNoteId.entries()).flatMap(
    ([originalNoteId, [, ...clones]]) =>
      clones.map((clone) => ({
        flow_id: newFlowId,
        ...remapPosition(clone, replaceValue),
        created_by: userId,
        note_id: newNoteIdByOriginalNoteId.get(originalNoteId),
      })),
  );

  if (cloneObjects.length > 0) {
    await $client.request(INSERT_FLOW_NOTE_POSITIONS, {
      objects: cloneObjects,
    });
  }
};
