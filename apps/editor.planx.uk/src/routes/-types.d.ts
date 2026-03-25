import "@tanstack/react-router";

declare module "@tanstack/react-router" {
  interface HistoryState {
    recentFlows?: {
      id: string;
      folderIds: string[];
    }[];
  }
}
