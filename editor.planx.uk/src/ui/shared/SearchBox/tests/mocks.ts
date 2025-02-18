import React from "react";
import { vi } from "vitest";

export type MockRecords = {
  name: string;
  slug: string;
};

export const mockRecords: MockRecords[] = [
  {
    name: "Search for me",
    slug: "search-for-me",
  },
  {
    name: "Do not search for me",
    slug: "do-not-search-for-me",
  },
  { name: "Unique name", slug: "unique-name" },
];

export const mockSetRecords = vi.fn() as React.Dispatch<
  React.SetStateAction<MockRecords[] | null>
>;
