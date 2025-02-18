import { vi } from "vitest";
import { FilterOptions } from "../Filter";

export type MockRecordType = {
  name: string;
  status: "online" | "offline";
};

export const mockRecords: MockRecordType[] = [
  {
    name: "offline-mock",
    status: "offline",
  },
  {
    name: "online-mock",
    status: "online",
  },
  {
    name: "online-1",
    status: "online",
  },
];

export const mockSetFilteredRecords = vi.fn() as React.Dispatch<
  React.SetStateAction<MockRecordType[] | null>
>;

export const mockFilterOptions: FilterOptions<MockRecordType>[] = [
  {
    displayName: "Online status",
    optionKey: "status",
    optionValue: ["online", "offline"],
    validationFn: (option: MockRecordType, value: string | undefined) =>
      option.status === value,
  },
  {
    displayName: "Name",
    optionKey: "name",
    optionValue: ["online-1", "offline-1"],
    validationFn: (option: MockRecordType, value: string | undefined) =>
      option.name === value,
  },
];
