/*
LAD20CD: E08000021
LAD20NM: Newcastle
LAD20NMW:
FID: 

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE08000021&entries=all&entry_date_day=&entry_date_month=&entry_date_year=
https://docs.google.com/spreadsheets/d/1GhxQEuKeSnrchZ_quxg6Rg7fHEWPDUr7/edit#gid=915271261
*/

import { LocalAuthorityMetadata } from "../../digitalLand";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  article4: {
    // Planx granular values link to Newcastle's source data in the following ways:
    //   * exact match of Digital Land's entity.reference
    records: {
      "article4.newcastle.brandyVaults": "A4BV",
      "article4.newcastle.dukesCottage": "A4DC",
      "article4.newcastle.hmo1": "A4HMO1",
      "article4.newcastle.hmo2": "A4HMO2",
      "article4.newcastle.hmo3": "A4HMO3",
      "article4.newcastle.northumberlandGardens": "A4NG",
      "article4.newcastle.northumberlandGardens2": "A4NG/E",
      "article4.newcastle.saintPetersBasin1": "A4SPBa1",
      "article4.newcastle.saintPetersBasin2": "A4SPBa2",
      "article4.newcastle.saintPetersBasin3": "A4SPBa3",
      "article4.newcastle.saintPetersBasin4": "A4SPBa4",
      "article4.newcastle.saintPetersBasin5": "A4SPBa5",
      "article4.newcastle.summerhill": "A4SH",
    },
  },
};

export {
  planningConstraints,
};
