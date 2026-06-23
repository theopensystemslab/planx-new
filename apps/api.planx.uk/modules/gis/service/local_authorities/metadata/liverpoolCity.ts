/*
LAD20CD: E08000012
LAD20NM: Liverpool City
LAD20NMW:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE08000012&q=&entry_date_day=&entry_date_month=&entry_date_year=
*/

import type { LocalAuthorityMetadata } from "../../helpers.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Only two actual A4 directions in Liverpool, others are planning conditions
    records: {
      "articleFour.liverpoolCity.liverpoolDirection": "A4Da407",
      "articleFour.liverpoolCity.dales": "A4Da408",
    },
  },
};

export { planningConstraints };
