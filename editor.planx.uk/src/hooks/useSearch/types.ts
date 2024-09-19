export interface UseSearchProps<T> {
  list: T[];
  keys: string[];
}

export interface SearchResult<T> {
  item: T;
  key: string;
  matchIndices: readonly [number, number][];
  refIndex: number;
}

export type SearchResults<T> = SearchResult<T>[];

export interface WorkerInitMessage<T> {
  type: "init";
  payload: UseSearchProps<T>;
}

export interface WorkerSearchMessage {
  type: "search";
  payload: {
    pattern: string;
  };
}

export type WorkerMessage<T> = WorkerInitMessage<T> | WorkerSearchMessage;

export interface WorkerMessageEvent<T> extends MessageEvent {
  data: WorkerMessage<T>;
}

interface WorkerResponseEvent<T> extends MessageEvent {
  data: SearchResult<T>[];
}

export interface SearchWorker<T extends object> extends Worker {
  postMessage(message: WorkerMessage<T>): void;
  onmessage:
    | ((this: SearchWorker<T>, ev: WorkerResponseEvent<T>) => void)
    | null;
}
