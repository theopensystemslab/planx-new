import Fuse, { IFuseOptions } from "fuse.js";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_OPTIONS: Required<SearchOptions> = {
  limit: 20,
};

interface SearchOptions {
  limit?: number;
}

interface UseSearchProps<T extends Record<string, unknown>> {
  list: T[];
  keys: string[];
  options?: SearchOptions;
}

export const useSearch = <T extends Record<string, unknown>>({
  list,
  keys,
  options,
}: UseSearchProps<T>) => {
  const [pattern, setPattern] = useState("");
  const [results, setResults] = useState<T[]>([]);

  const fuseOptions: IFuseOptions<T> = useMemo(
    () => ({
      threshold: 0.3,
      useExtendedSearch: true,
      keys,
    }),
    [keys],
  );

  const fuse = useMemo(
    () => new Fuse<T>(list, fuseOptions),
    [list, fuseOptions],
  );

  useEffect(() => {
    const fuseResults = fuse.search(pattern, {
      limit: options?.limit || DEFAULT_OPTIONS.limit,
    });
    setResults(fuseResults.map((result) => result.item));
  }, [pattern]);

  return { results, search: setPattern };
};
