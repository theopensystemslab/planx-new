/*
LAD20CD: E06000057
LAD20NM: Northumberland
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&q=&organisation_entity=220&entry_date_day=&entry_date_month=&entry_date_year=
https://docs.google.com/spreadsheets/d/1aJWZnYzv_97b-6hGPPkjpSD5-Req26QjA3tyXC6TkOk/edit?gid=0#gid=0
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to entity.article-4-direction on Planning Data
    records: {
      "articleFour.northumberland.a4d1": "A4D1",
      "articleFour.northumberland.a4d2": "A4D2",
      "articleFour.northumberland.a4d3": "A4D3",
      "articleFour.northumberland.a4d4": "A4D4",
      "articleFour.northumberland.a4d5": "A4D5",
      "articleFour.northumberland.a4d6": "A4D6",
    },
  },
};

export { planningConstraints };
