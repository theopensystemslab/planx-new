export type TreeData = {
  species: string;
  work: string;
  justification: string;
  urgency: "low" | "moderate" | "high" | "urgenct";
  label: string;
};

export const mockTreeData: TreeData = {
  species: "Larch",
  work: "Chopping it down",
  justification: "Cause I can",
  urgency: "low",
  label: "1",
};
