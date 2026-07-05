import type { TeamMember } from "../types";

const firstNames = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Edward",
  "Fiona",
  "George",
  "Hannah",
  "Joe",
  "Liz",
];
const lastNames = [
  "Smith",
  "Jones",
  "Brown",
  "Wilson",
  "Taylor",
  "Anderson",
  "Thomas",
  "Moore",
  "Johnson",
  "Appleseed",
];

export const mockTeamMembers: TeamMember[] = Array.from(
  { length: 20 },
  (_, i) => ({
    id: i + 1,
    firstName: firstNames[i < 10 ? i : i - 10],
    lastName: lastNames[i < 10 ? i : 19 - i],
    email: `${i + 1}@example.com`,
    role: "teamEditor",
    isPlatformAdmin: false,
    isAnalyst: false,
    defaultTeamId: 1,
  }),
);

export const mockArchivedTeamMembers: TeamMember[] = Array.from(
  { length: 2 },
  (_, i) => ({
    id: i + 1,
    firstName: firstNames[i],
    lastName: lastNames[i],
    email: "",
    role: "teamEditor",
    isPlatformAdmin: false,
    isAnalyst: false,
    defaultTeamId: 1,
  }),
);

export const mockTeamMembersAt19 = mockTeamMembers.slice(0, 19);
export const mockTeamMembersAt20 = mockTeamMembers.slice(0, 20);
