/*
LAD20CD: E08000037
LAD20NM: Gateshead
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE08000037&entry_date_day=&entry_date_month=&entry_date_year=
https://docs.google.com/spreadsheets/d/13RdEvCfydfSx6R6p4S742xubOhfea-tvR3n95sYUpvs/edit#gid=0
*/

import { LocalAuthorityMetadata } from "../../digitalLand";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  article4: {
    // Planx granular values link to Digital Land article-4-direction dataset and entity.reference
    records: {
      "article4.gateshead.saltwell.D1": "A401-01",
      "article4.gateshead.saltwell.D2": "A402-01",
      "article4.gateshead.saltwell.D3": "A403-01",
      "article4.gateshead.saltwell.D4": "A404-01",
      "article4.gateshead.saltwell.D5": "A405-01",
    },
  },
};

export { planningConstraints };
