/*
LAD20CD: E09000002
LAD20NM: Barking and Dagenham
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE09000002&entry_date_day=&entry_date_month=&entry_date_year=
https://docs.google.com/spreadsheets/d/1UmxQ95SjU72j0KaVIIkrIfhdE_k_lcFNhUWBc53GEIA/edit#gid=0
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to entity.reference on Planning Data
    records: {
      "articleFour.barkingAndDagenham.additionalStoreys.dagenhamVillage":
        "A4D01",
      "articleFour.barkingAndDagenham.additionalStoreys.lymington": "A4D02",
      "articleFour.barkingAndDagenham.becontree":
        "Proposed Becontree Design Guide Article 4",
      // "articleFour.barkingAndDagenham.becontree.corners": "TBD",
      "articleFour.barkingAndDagenham.hmo": "A4D03",
    },
  },
};

export { planningConstraints };
