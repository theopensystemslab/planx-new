import { AdminPanelData } from "types";

export const internalTeamNames = [
  "WikiHouse",
  "PlanX",
  "Open Systems Lab",
  "Testing",
  "Open Digital Planning",
  "Environment Agency",
  "Templates",
];

export const isCouncilTeam = () => {
  return (team: AdminPanelData) => !internalTeamNames.includes(team.name);
};
