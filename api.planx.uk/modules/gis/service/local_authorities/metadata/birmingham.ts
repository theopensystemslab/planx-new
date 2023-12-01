/*
LAD20CD: E08000025
LAD20NM: Birmingham
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE08000025&entry_date_day=&entry_date_month=&entry_date_year=
https://docs.google.com/spreadsheets/d/19t4DKDvyWix1Vf5huuQPVf9L8e6jcq1W/edit#gid=207440632
*/

import { LocalAuthorityMetadata } from "../../digitalLand";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  article4: {
    // Planx granular values link to Digital Land entity.reference
    records: {
      "article4.birmingham.austinVillage": "30",
      "article4.birmingham.bournvilleVillage": "8",
      "article4.birmingham.cityWideHMO": "36",
      "article4.birmingham.edgbaston": "15",
      "article4.birmingham.greenfieldRoad": "32",
      "article4.birmingham.highStSuttonColdfield": "13",
      "article4.birmingham.moorPool": "7",
      "article4.birmingham.moseleyVillage": "20",
      "article4.birmingham.oldYardley": "5",
      "article4.birmingham.sellyPark": "34",
      "article4.birmingham.sellyParkAvenues": "33",
      "article4.birmingham.stAgnes": "22",
    },
  },
};

export { planningConstraints };
