import type React from "react";

export interface SearchResultRelatedItem {
  key: string | number;
  tooltip: string;
  icon: React.ReactNode;
}

export interface SearchResultRelatedItems {
  label: string;
  items: SearchResultRelatedItem[];
}

export interface SearchResultAction {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface SearchResult {
  icon: React.ReactNode;
  title: string;
  description?: string;
  sourceTeam?: string;
  statusLabel?: string;
  meta?: string;
  tag?: React.ReactNode;
  relatedItems?: SearchResultRelatedItems;
  primaryAction?: SearchResultAction;
  secondaryAction?: SearchResultAction;
}
