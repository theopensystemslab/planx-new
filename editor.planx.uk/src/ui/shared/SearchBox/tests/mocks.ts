import React from "react";
import { vi } from "vitest";

export type MockRecords = {
  name: string;
  slug: string;
};

export const mockRecords: MockRecords[] = [
  {
    name: "Mock result one",
    slug: "mock-result-one",
  },
  {
    name: "Mock result two",
    slug: "mock-result-two",
  },
  { name: "Unique name", slug: "unique-name" },
];

/** This term should return the first two records */
export const mockFirstSearchTerm = "mock";

/** This term should return the last record */
export const mockSecondSearchTerm = "unique";

export const mockSetRecords = vi.fn() as React.Dispatch<
  React.SetStateAction<MockRecords[] | null>
>;
