import { GET_TEAM_QUERY } from "./../../../../utils";

export default [
  {
    request: {
      query: GET_TEAM_QUERY,
      variables: { team: "southwark" },
    },
    result: {
      data: {
        teams: [
          {
            theme: {},
            settings: {
              externalPlanningSite: {
                name: "Planning Portal",
                url: "https://www.planningportal.co.uk/",
              },
            },
            name: "Southwark",
          },
        ],
      },
    },
  },
];
