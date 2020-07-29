import { useCallback, useEffect, useMemo, useState } from "react";
import { useTransition } from "../../../react-experimental";
import { connectOp, Flow, insertNodeOp, removeNodeOp, setFlowOp } from "./flow";
import { connectToDB, getConnection } from "./sharedb";

// Custom hook for talking to a flow in ShareDB
function useFlow(config: {
  id: number | string;
}): {
  state: Flow | null;
  insertNode: () => void;
  removeNode: (id: string) => void;
  connectNodes: (src: string, tgt: string) => void;
  setFlow: (flow: Flow) => void;
  isPending: boolean;
} {
  // Setup

  const [startTransition, isPending] = useTransition();

  const [state, setState] = useState<Flow | null>(null);

  const doc = useMemo(() => getConnection(config.id), [config.id]);

  useEffect(() => {
    const cloneStateFromShareDB = () =>
      startTransition(() => {
        setState(JSON.parse(JSON.stringify(doc.data)));
      });

    connectToDB(doc).then(() => {
      cloneStateFromShareDB();
      doc.on("op", cloneStateFromShareDB);
    });

    return () => {
      setState(null);
      doc.destroy();
    };
  }, [doc, startTransition]);

  // Methods

  const insertNode = useCallback(() => {
    doc.submitOp(insertNodeOp());
  }, [doc]);

  const removeNode = useCallback(
    (id) => {
      doc.submitOp(removeNodeOp(id, null, doc.data));
    },
    [doc]
  );

  const connectNodes = useCallback(
    (src, tgt) => {
      doc.submitOp(connectOp(src, tgt, doc.data));
    },
    [doc]
  );

  const setFlow = useCallback(
    (flow) => {
      doc.submitOp(setFlowOp(flow, doc.data));
    },
    [doc]
  );

  // Public API

  return {
    state,
    insertNode,
    removeNode,
    setFlow,
    connectNodes,
    isPending,
  };
}

export default useFlow;
