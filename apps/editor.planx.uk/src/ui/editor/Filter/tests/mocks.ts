import { FilterOptions } from "../Filter";

export type MockRecordType = {
  name: string;
  status: "online" | "offline";
};

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
    optionValue: ["online-mock-2", "offline-mock-2"],
    validationFn: (option: MockRecordType, value: string | undefined) =>
      option.name === value,
  },
];
