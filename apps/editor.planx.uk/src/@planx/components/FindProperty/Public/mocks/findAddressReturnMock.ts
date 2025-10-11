import { FETCH_BLPU_CODES } from "..";

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
];
