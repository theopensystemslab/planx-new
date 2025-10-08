/*
LAD20CD: E08000037
LAD20NM: Gateshead
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE08000037&entry_date_day=&entry_date_month=&entry_date_year=
https://docs.google.com/spreadsheets/d/13RdEvCfydfSx6R6p4S742xubOhfea-tvR3n95sYUpvs/edit#gid=0
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to Digital Land article-4-direction dataset and entity.reference
    records: {
      "articleFour.gateshead.saltwell.dOne": "A401-01",
      "articleFour.gateshead.saltwell.dTwo": "A402-01",
      "articleFour.gateshead.saltwell.dThree": "A403-01",
      "articleFour.gateshead.saltwell.dFour": "A404-01",
      "articleFour.gateshead.saltwell.dFive": "A405-01",
    },
  },
};

export { planningConstraints };
