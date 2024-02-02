/*
LAD20CD: E09000002
LAD20NM: Barking and Dagenham
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE09000002&entry_date_day=&entry_date_month=&entry_date_year=
https://docs.google.com/spreadsheets/d/1UmxQ95SjU72j0KaVIIkrIfhdE_k_lcFNhUWBc53GEIA/edit#gid=0
*/

import { LocalAuthorityMetadata } from "../../digitalLand";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  article4: {
    // Planx granular values link to entity.reference on Planning Data
    records: {
      "article4.barkingAndDagenham.additionalStoreys.dagenhamVillage": "A4D01",
      "article4.barkingAndDagenham.additionalStoreys.lymington": "A4D02",
      "article4.barkingAndDagenham.becontree": "Proposed Becontree Design Guide Article 4",
      // "article4.barkingAndDagenham.becontree.corners": "TBD",
      "article4.barkingAndDagenham.hmo": "A4D03",
    },
  },
};

export { planningConstraints };
