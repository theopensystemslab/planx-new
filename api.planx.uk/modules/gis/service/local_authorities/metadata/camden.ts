/*
LAD20CD: E09000007
LAD20NM: Camden
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE09000007&entries=all&entry_date_day=&entry_date_month=&entry_date_year=
https://docs.google.com/spreadsheets/d/1pFzq0cv_cwDx33d8QgRPVfIXtiseSxgmwQb6cORCVYs/edit#gid=0
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to Digital Land entity.reference
    records: {
      "articleFour.camden.147kentishTown": "A4KTRa1",
      "articleFour.camden.187kentishTown": "A4KTRa2",
      "articleFour.camden.33yorkRise": "A4aYR1",
      "articleFour.camden.basements": "A4Ba3",
      "articleFour.camden.belsize": "A4Ba1",
      "articleFour.camden.belsizeAvenue": "A4Ba2",
      "articleFour.camden.eC3Caz": "A4EC3a1",
      "articleFour.camden.eC3NoCaz": "A4EC3b1",
      "articleFour.camden.fitzjohnAvenue": "A4Fa2",
      "articleFour.camden.frognal": "A4Fa1",
      "articleFour.camden.hampstead": "A4Ha1",
      "articleFour.camden.parkway": "A4Pa2",
      "articleFour.camden.primroseHill": "A4Pa1",
      "articleFour.camden.southHill": "A4aSHP1",
      "articleFour.camden.suiGenC3": "A4SGC3a1",
      "articleFour.camden.swissCottage": "A4Sa1",
    },
  },
};

export { planningConstraints };
