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
      "article4.camden.147kentishTown": "",
      "article4.camden.187kentishTown": "",
      "article4.camden.33yorkRise": "",
      "article4.camden.basements": "",
      "article4.camden.belsize": "",
      "article4.camden.belsizeAvenue": "",
      "article4.camden.eC3Caz": "",
      "article4.camden.eC3NoCaz": "",
      "article4.camden.fitzjohnAvenue": "",
      "article4.camden.frognal": "",
      "article4.camden.hampstead": "A4Ha1",
      "article4.camden.parkway": "",
      "article4.camden.primroseHill": "",
      "article4.camden.southHill": "A4aSHP1",
      "article4.camden.suiGenC3": "",
      "article4.camden.swissCottage": "",
    },
  },
};

export { planningConstraints };
