import {
  DBSchema,
  IDBPDatabase,
  IDBPTransaction,
  openDB,
  StoreNames,
} from "idb";
import { Session } from "types";

import { clearLocalFlow, getLocalFlow } from "./local";

// define IndexedDB database name and version (should be bumped when changing the schema)
const DB_VERSION = 1;
const LOCAL_STORAGE_KEY_PREFIX = "flow:";
export const DB_NAME = "planx";
export const DB_STORE_FLOW_SESSIONS = "flows";

interface PlanXIDB extends DBSchema {
  [DB_STORE_FLOW_SESSIONS]: {
    key: string; // flow ID
    value: Session; // Session object
  };
}

export const getDb = async (): Promise<IDBPDatabase<PlanXIDB>> => {
  return await openDB<PlanXIDB>(DB_NAME, DB_VERSION, {
    async upgrade(db, oldVersion, newVersion, tx) {
      console.debug(
        `Upgrading IndexedDB from version ${oldVersion} to ${newVersion}`,
      );
      // create a store for flows if it doesn't exist
      if (!db.objectStoreNames.contains(DB_STORE_FLOW_SESSIONS)) {
        db.createObjectStore(DB_STORE_FLOW_SESSIONS);
      }
      // pass versionchange transaction down to migration logic
      const success = await migrateLocalStorageToIdb(tx);
      if (success > 0) {
        // bubble error up to ensure a connection to the malformed db is not established
        throw Error(
          "Migration from localStorage failed - not upgrading IndexedDB",
        );
      }
    },
    // we include logs to debug cases where multiple db connections conflict (unlikely to occur under v1))
    blocked() {
      console.warn(
        "IndexedDB upgrade is blocked for this tab, likely because another tab has an open connection",
      );
    },
    blocking() {
      console.warn(
        "IndexedDB connection on this tab is blocking another tab from upgrading the database",
      );
    },
  });
};

export const getLocalFlowIdb = async (
  flowId: string,
): Promise<Session | undefined> => {
  console.debug(
    `Retrieving flow with ID ${flowId} from IndexedDB (if it exists)`,
  );
  let db: IDBPDatabase<PlanXIDB> | undefined;
  try {
    db = await getDb();
    const session = await db.get(DB_STORE_FLOW_SESSIONS, flowId);
    return session;
  } catch (e) {
    console.error(`Error retrieving flow with ID ${flowId} from IndexedDB:`, e);
    return undefined;
  } finally {
    // in any case, we close the db connection to avoid memory leaks
    db?.close();
  }
};

export const setLocalFlowIdb = async (
  flowId: string,
  session: Session,
): Promise<void> => {
  console.debug(`Storing flow with ID ${flowId} to IndexedDB`);
  let db: IDBPDatabase<PlanXIDB> | undefined;
  try {
    db = await getDb();
    await db.put(DB_STORE_FLOW_SESSIONS, session, flowId);
  } catch (e) {
    console.error(`Error storing flow with ID ${flowId} in IndexedDB:`, e);
  } finally {
    db?.close();
  }
};

export const clearLocalFlowIdb = async (flowId: string): Promise<void> => {
  console.debug(`Clearing flow with ID ${flowId} from IndexedDB`);
  let db: IDBPDatabase<PlanXIDB> | undefined;
  try {
    db = await getDb();
    await db.delete(DB_STORE_FLOW_SESSIONS, flowId);
  } catch (e) {
    console.error(`Error clearing flow with ID ${flowId} from IndexedDB:`, e);
  } finally {
    db?.close();
  }
};

// we need a method for migrating existing sessions across from localStorage
export const migrateLocalStorageToIdb = async (
  tx: IDBPTransaction<PlanXIDB, StoreNames<PlanXIDB>[], "versionchange">,
): Promise<number> => {
  console.debug(`Checking for flows in localStorage to migrate to IndexedDB`);
  try {
    // get all flow IDs present in localStorage
    const keys = Object.keys(localStorage);
    const flowIds = keys
      .filter((key) => key.startsWith(LOCAL_STORAGE_KEY_PREFIX))
      .map((key) => key.replace(LOCAL_STORAGE_KEY_PREFIX, ""));

    // exit if no flows to migrate
    if (flowIds.length === 0) {
      console.debug("No flows in localStorage to migrate");
      return 0;
    }

    console.log(
      `Migrating ${flowIds.length} flow(s) from localStorage to IndexedDB`,
    );
    const store = tx.objectStore(DB_STORE_FLOW_SESSIONS);
    const failed_migrations = new Set<string>();
    for (const flowId of flowIds) {
      try {
        const session = getLocalFlow(flowId);
        if (session) {
          await store.put(session, flowId);
          console.debug(`Migrated flow to IndexedDB: ${flowId}`);
        }
      } catch (e) {
        // we let the migration attempt continue for debugging purposes, and bubble the error up later
        console.error(`Error migrating flow ${flowId}:`, e);
        failed_migrations.add(flowId);
      }
    }
    if (failed_migrations.size > 0) {
      const sortedFailedMigrations = Array.from(failed_migrations).sort();
      throw new Error(
        `Failed to migrate ${failed_migrations.size} flows: ${sortedFailedMigrations.join(", ")}`,
      );
    }
    // now that we are sure of a complete and successful migration, we can clear localStorage entries
    for (const flowId of flowIds) {
      clearLocalFlow(flowId);
      console.debug(`Cleared flow from localStorage: ${flowId}`);
    }
    // we don't need to manually commit the transaction - this is handled when upgrade() returns
    console.log("Migration completed successfully");
    return 0;
  } catch (e) {
    console.error("Error during migration:", e);
    return 1;
  }
};
