/*
LAD20CD: E07000083
LAD20NM: Tewkesbury
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE07000083&entry_date_day=&entry_date_month=&entry_date_year=#52.00734014476549,-2.034074923920798,15.123289382038873z
https://docs.google.com/spreadsheets/d/19VMxVhzIt3z1CcvlhELuUxablfbw40Ri/edit#gid=1979469480
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to Digital Land article-4-direction dataset and entity.reference
    records: {
      "articleFour.tewkesbury.ashleworthgreen": "A4Da2",
      "articleFour.tewkesbury.buckland": "A4Da3",
      "articleFour.tewkesbury.dumbleton": "A4Da4",
      "articleFour.tewkesbury.forthampton": "A4Da5",
      "articleFour.tewkesbury.laverton": "A4Da7",
      "articleFour.tewkesbury.stanton": "A4Da8",
      "articleFour.tewkesbury.tewkesbury": "A4Da9",
      "articleFour.tewkesbury.twyningchurchend": "A4Da1",
      "articleFour.tewkesbury.washbourne": "A4Da6",
      "articleFour.tewkesbury.winchcombe": "A4Da10",
    },
  },
};

export { planningConstraints };
