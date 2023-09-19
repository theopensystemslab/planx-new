/*
LAD20CD: E09000007
LAD20NM: Camden
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE09000007&entries=all&entry_date_day=&entry_date_month=&entry_date_year=
https://docs.google.com/spreadsheets/d/1pFzq0cv_cwDx33d8QgRPVfIXtiseSxgmwQb6cORCVYs/edit#gid=0
*/

import { LocalAuthorityMetadata } from "../../digitalLand";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  article4: {
    // Planx granular values link to Digital Land entity.reference
    records: {
      "article4.camden.147kentishTown": "A4KTRa1",
      "article4.camden.187kentishTown": "A4KTRa2",
      "article4.camden.33yorkRise": "A4aYR1",
      "article4.camden.basements": "A4Ba3",
      "article4.camden.belsize": "A4Ba1",
      "article4.camden.belsizeAvenue": "A4Ba2",
      "article4.camden.eC3Caz": "A4EC3a1",
      "article4.camden.eC3NoCaz": "A4EC3b1",
      "article4.camden.fitzjohnAvenue": "A4Fa2",
      "article4.camden.frognal": "A4Fa1",
      "article4.camden.hampstead": "A4Ha1",
      "article4.camden.parkway": "A4Pa2",
      "article4.camden.primroseHill": "A4Pa1",
      "article4.camden.southHill": "A4aSHP1",
      "article4.camden.suiGenC3": "A4SGC3a1",
      "article4.camden.swissCottage": "A4Sa1",
    },
  },
};

export { planningConstraints };
