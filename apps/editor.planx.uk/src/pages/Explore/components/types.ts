export interface Template {
  id: string;
  name: string;
  summary: string;
  team: {
    name: string;
  };
  subscription?: { id: string }[];
}
