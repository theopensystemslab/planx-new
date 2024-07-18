import Fuse, { IFuseOptions } from "fuse.js";
import { useEffect, useMemo, useState } from "react";

interface UseSearchProps<T extends object> {
  list: T[];
  keys: string[];
}

export const useSearch = <T extends object>({
  list,
  keys,
}: UseSearchProps<T>) => {
  const [pattern, setPattern] = useState("");
  const [results, setResults] = useState<T[]>([]);

  const fuseOptions: IFuseOptions<T> = useMemo(
    () => ({
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
    const fuseResults = fuse.search(pattern);
    setResults(fuseResults.map((result) => result.item));
  }, [pattern]);

  return { results, search: setPattern };
};
