import Fuse, { FuseOptionKey, IFuseOptions } from "fuse.js";
import { useEffect, useMemo, useState } from "react";

interface UseSearchProps<T extends object> {
  list: T[];
  keys: Array<FuseOptionKey<T>>;
  searchType?: "word-match" | "letter-match"
}

export interface SearchResult<T extends object> {
  /** Original indexed item */
  item: T;
  /** Key used to locate value to search against */
  key: string;
  /** Indices within searched string that match search term */
  matchIndices: [number, number][];
  /** String matched against - does not necessarily equate to item[key] */
  matchValue: string;
  /** Index within flattened array of item[key] */
  refIndex: number;
}

export type SearchResults<T extends object> = SearchResult<T>[];

export const useSearch = <T extends object>({
  list,
  keys,
  searchType = "letter-match"
}: UseSearchProps<T>) => {
  const [pattern, setPattern] = useState("");
  const [results, setResults] = useState<SearchResults<T>>([]);

  const fuseOptions: IFuseOptions<T> = useMemo(
    () => ({
      useExtendedSearch: true,
      includeMatches: true,
      minMatchCharLength: 3,
      ignoreLocation: true,
      keys,
    }),
    [keys],
  );

  const fuse = useMemo(
    () => new Fuse<T>(list, fuseOptions),
    [list, fuseOptions],
  );

  useEffect(() => {
    const fuseResults = searchType === "word-match" ? fuse.search(formatSearchPattern(pattern)) : fuse.search(pattern)
    setResults(
      fuseResults.map((result) => {
        // Required type narrowing for FuseResult
        if (!result.matches) throw Error("Matches missing from FuseResults");

        return {
          item: result.item,
          key: result.matches?.[0].key || "",
          // We only display the first match
          matchIndices: result.matches[0].indices as [number, number][],
          matchValue: result.matches[0].value!,
          refIndex: result.matches[0]?.refIndex || 0,
        };
      }),
    );
  }, [pattern, fuse, searchType]);

  return { results, search: setPattern };
};

const formatSearchPattern = (pattern: string) => {

  // split pattern by words and remove empty spaces
  const patternArray = pattern.split(" ").filter(Boolean)

  // In FuseJS extended search the character: ' 
  // is used for the include-match search option
  // so it will include this whole word in matching
  const formattedPattern = `'${patternArray.join(" '")}`

  return formattedPattern
}
