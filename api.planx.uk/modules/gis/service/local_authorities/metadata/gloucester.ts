/*
LAD20CD: E07000081
LAD20NM: Gloucester
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction&dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE07000081&entry_date_day=&entry_date_month=&entry_date_year=
https://docs.google.com/spreadsheets/d/1ALSH4hiupdUlrA7Rq7jhfHnWr0-PcB-IzhsztPLl7FY/edit?gid=0#gid=0
*/

import { LocalAuthorityMetadata } from "../../digitalLand";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  article4: {
    // Planx granular values link to Digital Land entity.reference
    records: {
      "article4.gloucester.SouthgateStreetConservationArea":
        "Southgate Street Conservation Area",
      "article4.gloucester.StMichaelsSquare":
        "St Michael’s Square Article 4 direction",
    },
  },
};

export { planningConstraints };
