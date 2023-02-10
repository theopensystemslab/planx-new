import { FETCH_BLPU_CODES } from "@planx/components/FindProperty/Public";

import { GET_TEAM_QUERY } from "./../../../../utils";

export default [
  {
    request: {
      query: FETCH_BLPU_CODES,
      variables: {},
    },
    result: {
      data: {
        blpu_codes: [
          {
            code: "RH01",
            description: "HMO Parent",
            value: "residential.HMO.parent",
          },
        ],
      },
    },
  },
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
