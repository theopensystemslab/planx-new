import Fuse, { FuseOptionKey, IFuseOptions } from "fuse.js";
import { useEffect, useMemo, useState } from "react";

interface UseSearchProps<T extends object> {
  list: T[];
  keys: Array<FuseOptionKey<T>>;
}

export interface SearchResult<T extends object> {
  item: T;
  key: string;
  matchIndices: [number, number][];
  refIndex: number;
}

export type SearchResults<T extends object> = SearchResult<T>[];

export const useSearch = <T extends object>({
  list,
  keys,
}: UseSearchProps<T>) => {
  const [pattern, setPattern] = useState("");
  const [results, setResults] = useState<SearchResults<T>>([]);

  const fuseOptions: IFuseOptions<T> = useMemo(
    () => ({
      useExtendedSearch: true,
      includeMatches: true,
      minMatchCharLength: 3,
      keys,
    }),
    [keys],
  );

  const fuse = useMemo(
    () => new Fuse<T>(list, fuseOptions),
    [list, fuseOptions],
  );

  useEffect(() => {
    const fuseResults = fuse.search(pattern);
    setResults(
      fuseResults.map((result) => {
        // Required type narrowing for FuseResult
        if (!result.matches) throw Error("Matches missing from FuseResults");

        return {
          item: result.item,
          key: result.matches?.[0].key || "",
          // We only display the first match
          matchIndices: result.matches[0].indices as [number, number][],
          refIndex: result.matches[0]?.refIndex || 0,
        };
      }),
    );
  }, [pattern, fuse]);

  return { results, search: setPattern };
};
