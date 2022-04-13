import stringify from "json-stable-stringify";

import { FEATURE_FLAG__CAN_SAVE_AND_RETURN } from "./featureFlags";
import { lowcalStorage } from "./lowcalStorage";

export const getLocalFlow = FEATURE_FLAG__CAN_SAVE_AND_RETURN
  ? async (id: string) => {
      const entry = `flow:${id}`;
      try {
        const state = await lowcalStorage.getItem(entry);
        if (state) return JSON.parse(state);
      } catch (e) {
        // Clean up just in case
        await lowcalStorage.removeItem(entry);
      }
    }
  : (id: string) => {
      const entry = `flow:${id}`;
      try {
        const state = localStorage.getItem(entry);
        if (state) return JSON.parse(state);
      } catch (e) {
        // Clean up just in case
        localStorage.removeItem(entry);
      }
    };

export const setLocalFlow = FEATURE_FLAG__CAN_SAVE_AND_RETURN
  ? async (id: string, args: { [key: string]: any }) => {
      await lowcalStorage.setItem(`flow:${id}`, stringify(args));
    }
  : (id: string, args: { [key: string]: any }) => {
      localStorage.setItem(`flow:${id}`, JSON.stringify(args));
    };

export const clearLocalFlow = FEATURE_FLAG__CAN_SAVE_AND_RETURN
  ? async (id: string) => {
      await lowcalStorage.removeItem(`flow:${id}`);
    }
  : (id: string) => {
      localStorage.removeItem(`flow:${id}`);
    };
