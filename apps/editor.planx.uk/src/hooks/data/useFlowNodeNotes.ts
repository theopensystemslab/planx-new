import {
  type ApolloClient,
  gql,
  useMutation,
  useSubscription,
} from "@apollo/client";

export type NotePlacement =
  | "attached_to_node"
  | "attached_to_option"
  | "after_node"
  | "before_node";

export interface FlowNodeNote {
  id: string;
  flowId: string;
  nodeId: string;
  placement: NotePlacement;
  text: string;
  color: string;
  createdBy: number;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
  createdByUser?: {
    firstName: string;
    lastName: string;
  };
  updatedByUser?: {
    firstName: string;
    lastName: string;
  };
}

const FLOW_NODE_NOTE_FIELDS = gql`
  fragment FlowNodeNoteFields on flow_node_notes {
    id
    flowId: flow_id
    nodeId: node_id
    placement
    text
    color
    createdBy: created_by
    updatedBy: updated_by
    createdAt: created_at
    updatedAt: updated_at
    createdByUser {
      firstName: first_name
      lastName: last_name
    }
    updatedByUser {
      firstName: first_name
      lastName: last_name
    }
  }
`;

const GET_FLOW_NODE_NOTES = gql`
  ${FLOW_NODE_NOTE_FIELDS}
  subscription GetFlowNodeNotes($flowId: uuid!) {
    flow_node_notes(
      where: { flow_id: { _eq: $flowId } }
      order_by: { created_at: asc }
    ) {
      ...FlowNodeNoteFields
    }
  }
`;

export const GET_FLOW_NODE_NOTE_BY_ID = gql`
  ${FLOW_NODE_NOTE_FIELDS}
  query GetFlowNodeNoteById($id: uuid!) {
    flow_node_notes_by_pk(id: $id) {
      ...FlowNodeNoteFields
    }
  }
`;

export const ADD_FLOW_NODE_NOTE = gql`
  mutation AddFlowNodeNote(
    $flowId: uuid!
    $nodeId: String!
    $placement: String!
    $text: String!
    $color: String!
    $createdBy: Int!
  ) {
    insert_flow_node_notes_one(
      object: {
        flow_id: $flowId
        node_id: $nodeId
        placement: $placement
        text: $text
        color: $color
        created_by: $createdBy
      }
    ) {
      id
    }
  }
`;

export const UPDATE_FLOW_NODE_NOTE = gql`
  mutation UpdateFlowNodeNote(
    $id: uuid!
    $text: String!
    $color: String!
    $updatedBy: Int!
  ) {
    update_flow_node_notes_by_pk(
      pk_columns: { id: $id }
      _set: { text: $text, color: $color, updated_by: $updatedBy }
    ) {
      id
      updatedAt: updated_at
    }
  }
`;

export const DELETE_FLOW_NODE_NOTE = gql`
  mutation DeleteFlowNodeNote($id: uuid!) {
    delete_flow_node_notes_by_pk(id: $id) {
      id
    }
  }
`;

export const DELETE_FLOW_NODE_NOTES_FOR_NODE = gql`
  mutation DeleteFlowNodeNotesForNode($flowId: uuid!, $nodeId: String!) {
    delete_flow_node_notes(
      where: { flow_id: { _eq: $flowId }, node_id: { _eq: $nodeId } }
    ) {
      affected_rows
    }
  }
`;

interface AddNoteInput {
  flowId: string;
  nodeId: string;
  placement: NotePlacement;
  text: string;
  color?: string;
  createdBy: number;
}

interface UpdateNoteInput {
  id: string;
  text: string;
  color: string;
  updatedBy: number;
}

interface UseFlowNodeNotesResult {
  notes: FlowNodeNote[];
  loading: boolean;
  notesForNode: (nodeId: string) => FlowNodeNote[];
  addNote: (input: AddNoteInput) => Promise<void>;
  updateNote: (input: UpdateNoteInput) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  deleteNotesForNode: (flowId: string, nodeId: string) => Promise<void>;
}

export const useFlowNodeNotes = (flowId: string): UseFlowNodeNotesResult => {
  const skip = !flowId;

  const { data, loading } = useSubscription<{
    flow_node_notes: FlowNodeNote[];
  }>(GET_FLOW_NODE_NOTES, { variables: { flowId }, skip });

  console.log("flow_node_notes", data?.flow_node_notes);

  const [addNoteMutation] = useMutation(ADD_FLOW_NODE_NOTE);
  const [updateNoteMutation] = useMutation(UPDATE_FLOW_NODE_NOTE);
  const [deleteNoteMutation] = useMutation(DELETE_FLOW_NODE_NOTE);
  const [deleteNotesForNodeMutation] = useMutation(
    DELETE_FLOW_NODE_NOTES_FOR_NODE,
  );

  const notes = data?.flow_node_notes ?? [];

  const notesForNode = (nodeId: string): FlowNodeNote[] =>
    notes.filter((n) => n.nodeId === nodeId);

  const addNote = async (input: AddNoteInput): Promise<void> => {
    await addNoteMutation({
      variables: {
        flowId: input.flowId,
        nodeId: input.nodeId,
        placement: input.placement,
        text: input.text,
        color: input.color ?? "#fffdb0",
        createdBy: input.createdBy,
      },
    });
  };

  const updateNote = async ({
    id,
    text,
    color,
    updatedBy,
  }: UpdateNoteInput): Promise<void> => {
    await updateNoteMutation({ variables: { id, text, color, updatedBy } });
  };

  const deleteNote = async (id: string): Promise<void> => {
    await deleteNoteMutation({ variables: { id } });
  };

  const deleteNotesForNode = async (
    flowId: string,
    nodeId: string,
  ): Promise<void> => {
    await deleteNotesForNodeMutation({ variables: { flowId, nodeId } });
  };

  return {
    notes,
    loading,
    notesForNode,
    addNote,
    updateNote,
    deleteNote,
    deleteNotesForNode,
  };
};

export const addFlowNodeNote = async (
  client: ApolloClient<object>,
  input: AddNoteInput,
): Promise<void> => {
  await client.mutate({
    mutation: ADD_FLOW_NODE_NOTE,
    variables: {
      flowId: input.flowId,
      nodeId: input.nodeId,
      placement: input.placement,
      text: input.text,
      color: input.color ?? "#fffdb0",
      createdBy: input.createdBy,
    },
  });
};

export const updateFlowNodeNote = async (
  client: ApolloClient<object>,
  input: UpdateNoteInput,
): Promise<void> => {
  await client.mutate({
    mutation: UPDATE_FLOW_NODE_NOTE,
    variables: {
      id: input.id,
      text: input.text,
      color: input.color,
      updatedBy: input.updatedBy,
    },
  });
};

export const deleteFlowNodeNote = async (
  client: ApolloClient<object>,
  id: string,
): Promise<void> => {
  await client.mutate({
    mutation: DELETE_FLOW_NODE_NOTE,
    variables: { id },
  });
};
