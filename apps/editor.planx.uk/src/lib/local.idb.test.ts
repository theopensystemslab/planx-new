import "fake-indexeddb/auto";

import { deleteDB } from "idb";

import { Session } from "../types";
import { getLocalFlow, setLocalFlow } from "./local";
import {
  clearLocalFlowIdb,
  DB_NAME,
  DB_STORE_FLOW_SESSIONS,
  getDb,
  getLocalFlowIdb,
  setLocalFlowIdb,
} from "./local.idb";

const clearState = async () => {
  localStorage.clear();
  await deleteDB(DB_NAME, {
    blocked: () => {
      throw new Error("Blocked from deleting IndexedDB during test setup");
    },
  });
};

describe("IndexedDB methods", () => {
  // define some dummy constants
  const flowId = "1234";
  const sessionId = "5678";
  const session: Session = {
    id: flowId,
    passport: {},
    breadcrumbs: {},
    sessionId: sessionId,
  };

  // ensure we have a clean state before each test, and cleanup at the end
  beforeEach(clearState);
  afterAll(clearState);

  it("getDb should open db and return an instance with appropriate object store", async () => {
    const db = await getDb();
    expect(db).toBeDefined();
    expect(db.name).toBe(DB_NAME);
    expect(db.objectStoreNames.contains(DB_STORE_FLOW_SESSIONS)).toBe(true);
    db.close();
  });

  it("setLocalFlowIdb should set a flow session, getLocalFlowIdb should get it, clearLocalFlowIdb should clear it", async () => {
    await setLocalFlowIdb(flowId, session);

    const storedSession = await getLocalFlowIdb(flowId);
    if (!storedSession) throw new Error("No session!");
    expect(storedSession.id).toBe(flowId);
    expect(storedSession.sessionId).toBe(sessionId);

    await clearLocalFlowIdb(flowId);
    const clearedSession = await getLocalFlowIdb(flowId);
    expect(clearedSession).toBeUndefined();
  });

  it("getDb should migrate flows from localStorage to IndexedDB if any exist", async () => {
    // first store a flow in localStorage
    setLocalFlow(flowId, session);

    // this should trigger migration, since getLocalFlowIdb awaits getDb
    const storedSession = await getLocalFlowIdb(flowId);

    // if migration is successful, flow should be in IndexedDB
    if (!storedSession) throw new Error("No session!");
    expect(storedSession?.id).toBe(flowId);
    expect(storedSession?.sessionId).toBe(sessionId);

    // and should no longer be in localStorage
    const clearedSession = getLocalFlow(flowId);
    expect(clearedSession).toBeUndefined();
  });
});
