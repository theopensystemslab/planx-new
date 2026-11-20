/*
LAD20CD: E08000012
LAD20NM: Liverpool
LAD20NMW:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE08000012&q=&entry_date_day=&entry_date_month=&entry_date_year=
*/

import type { LocalAuthorityMetadata } from "../../helpers.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Only these are actual A4 directions in Liverpool, others are planning conditions
    records: {
      "articleFour.liverpool.liverpoolDirection": "A4Da407",
      "articleFour.liverpool.dales": "A4Da408",
      "articleFour.liverpool.kirkdale": "A4D1",
      "articleFour.liverpool.tuebrook": "A4D2",
      "articleFour.liverpool.oldSwanEast": "A4D3",
      "articleFour.liverpool.pennyLane": "A4D4",
      "articleFour.liverpool.stMichaels": "A4D5",
    },
  },
};

export { planningConstraints };
