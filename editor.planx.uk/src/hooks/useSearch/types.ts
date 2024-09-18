import { FuseOptionKey } from "fuse.js";

export interface UseSearchProps<T extends object> {
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
