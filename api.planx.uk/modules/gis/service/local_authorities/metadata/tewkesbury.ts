/*
LAD20CD: E07000083
LAD20NM: Tewkesbury
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE07000083&entry_date_day=&entry_date_month=&entry_date_year=#52.00734014476549,-2.034074923920798,15.123289382038873z
https://docs.google.com/spreadsheets/d/19VMxVhzIt3z1CcvlhELuUxablfbw40Ri/edit#gid=1979469480
*/

import { LocalAuthorityMetadata } from "../../digitalLand";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  article4: {
    // Planx granular values link to Digital Land article-4-direction dataset and entity.reference
    records: {
      "article4.tewkesbury.ashleworthgreen": "A4Da2",
      "article4.tewkesbury.buckland": "A4Da3",
      "article4.tewkesbury.dumbleton": "A4Da4",
      "article4.tewkesbury.forthampton": "A4Da5",
      "article4.tewkesbury.laverton": "A4Da7",
      "article4.tewkesbury.stanton": "A4Da8",
      "article4.tewkesbury.tewkesbury": "A4Da9",
      "article4.tewkesbury.twyningchurchend": "A4Da1",
      "article4.tewkesbury.washbourne": "A4Da6",
      "article4.tewkesbury.winchcombe": "A4Da10",
    },
  },
};

export { planningConstraints };
