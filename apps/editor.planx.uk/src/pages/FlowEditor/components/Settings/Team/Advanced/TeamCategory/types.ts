import type { TeamCategory } from "lib/teamCategories";

export interface TeamCategoryFormValues {
  category: TeamCategory;
}

export interface GetTeamCategoryData {
  teams: {
    id: number;
    category: TeamCategory;
  }[];
}

export interface UpdateTeamCategoryVariables {
  teamId: number;
  category: TeamCategory;
}
