import { FETCH_BLPU_CODES, GET_TEAM_QUERY } from "..";

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
      variables: { team: "canterbury" },
    },
    result: {
      data: {
        teams: [
          {
            gss_code: "1234",
            theme: {},
          },
        ],
      },
    },
  },
];
