/*
LAD20CD: E08000025
LAD20NM: Birmingham
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE08000025&entry_date_day=&entry_date_month=&entry_date_year=
https://docs.google.com/spreadsheets/d/19t4DKDvyWix1Vf5huuQPVf9L8e6jcq1W/edit#gid=207440632
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to Digital Land entity.reference
    records: {
      "articleFour.birmingham.austinVillage": "30",
      "articleFour.birmingham.bournvilleVillage": "8",
      "articleFour.birmingham.cityWideHMO": "36",
      "articleFour.birmingham.edgbaston": "15",
      "articleFour.birmingham.greenfieldRoad": "32",
      "articleFour.birmingham.highStSuttonColdfield": "13",
      "articleFour.birmingham.moorPool": "7",
      "articleFour.birmingham.moseleyVillage": "20",
      "articleFour.birmingham.oldYardley": "5",
      "articleFour.birmingham.sellyOak": "35",
      "articleFour.birmingham.sellyPark": "34",
      "articleFour.birmingham.sellyParkAvenues": "33",
      "articleFour.birmingham.stAgnes": "22",
    },
  },
};

export { planningConstraints };
