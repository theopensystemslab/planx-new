import Fuse, { FuseResult } from "fuse.js";
import { exhaustiveCheck } from "utils";

import {
  SearchResult,
  WorkerInitMessage,
  WorkerMessageEvent,
  WorkerSearchMessage,
} from "./types";

let fuse: Fuse<object>;

/**
 * Web worker which is responsible for running search in an isolated thread
 */
self.onmessage = (event: WorkerMessageEvent<object>) => {
  const messageType = event.data.type;

  switch (messageType) {
    case "init":
      return initialise(event.data);

    case "search":
      return search(event.data);

    default:
      exhaustiveCheck(messageType);
  }
};

const initialise = ({ payload }: WorkerInitMessage<object>) => {
  const fuseOptions = {
    useExtendedSearch: true,
    includeMatches: true,
    minMatchCharLength: 3,
    keys: payload.keys,
  };
  fuse = new Fuse(payload.list, fuseOptions);
};

const search = ({ payload }: WorkerSearchMessage) => {
  console.debug("Search for pattern: ", payload.pattern);

  const fuseResults = fuse.search(payload.pattern);
  const searchResults = fuseResults.map(convertToSearchResult);

  self.postMessage(searchResults);
};

const convertToSearchResult = (
  result: FuseResult<object>
): SearchResult<object> => {
  if (!result.matches) throw Error("Matches missing from FuseResults");

  return {
    item: result.item,
    key: result.matches?.[0]?.key || "",
    matchIndices: result.matches[0]?.indices || [],
    refIndex: result.matches[0]?.refIndex || 0,
  };
};