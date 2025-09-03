/*
LAD20CD: E06000025
LAD20NM: South Gloucestershire
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction&dataset=article-4-direction-area&dataset=article-4-direction-rule&geometry_curie=statistical-geography%3AE06000025&entry_date_day=&entry_date_month=&entry_date_year=
https://docs.google.com/spreadsheets/d/1_VsCrZSwaKb1vhLtxgeV7eOfly6dhUGRscD6HDVoB_0/edit?gid=0#gid=0
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to entity.reference on Planning Data
    records: {
      "articleFour.southGloucestershire.stokePark": "ART4/8/1",
      "articleFour.southGloucestershire.gloucesterRoadNorth": "ART4/8",
    },
  },
};

export { planningConstraints };
