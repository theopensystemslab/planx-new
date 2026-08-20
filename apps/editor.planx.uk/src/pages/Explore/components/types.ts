export interface Template {
  id: string;
  name: string;
  summary: string;
  team: {
    name: string;
  };
  subscribedTeams?: { id: string }[];
}
