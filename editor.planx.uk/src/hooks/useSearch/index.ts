import { useEffect, useState } from "react";

import { SearchResults, SearchWorker, UseSearchProps } from "./types";

/***
 * Custom hook for handling search via Fuse.js
 * Offloads search functionality to a web worker in an isolated thread
 * This hook is responsible for posting and receiving messages only
 */
export const useSearch = <T extends object>({
  list,
  keys,
}: UseSearchProps<T>) => {
  const [pattern, setPattern] = useState("");
  const [results, setResults] = useState<SearchResults<T>>([]);
  const [worker, setWorker] = useState<SearchWorker<T> | null>(null);

  useEffect(() => {
    const workerInstance: SearchWorker<T> = new Worker(
      new URL("./searchWorker.ts", import.meta.url),
      { type: "module" }
    );

    setWorker(workerInstance);

    workerInstance.postMessage({
      type: "init",
      payload: { list, keys },
    });

    return () => workerInstance.terminate();
  }, [list, keys]);

  useEffect(() => {
    if (!worker || !pattern) return;

    worker.postMessage({
      type: "search",
      payload: { pattern },
    });

    worker.onmessage = ({ data }) => setResults(data);

    worker.onerror = (error) => console.error("Search worker error: ", error);

  }, [worker, list, pattern]);

  return { results, search: setPattern };
};
