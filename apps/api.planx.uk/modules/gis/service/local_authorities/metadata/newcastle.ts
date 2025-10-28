/*
LAD20CD: E08000021
LAD20NM: Newcastle
LAD20NMW:
FID: 

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE08000021&entries=all&entry_date_day=&entry_date_month=&entry_date_year=
https://docs.google.com/spreadsheets/d/1GhxQEuKeSnrchZ_quxg6Rg7fHEWPDUr7/edit#gid=915271261
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to Newcastle's source data in the following ways:
    //   * exact match of Digital Land's entity.reference
    records: {
      "articleFour.newcastle.brandyVaults": "A4BV",
      "articleFour.newcastle.dukesCottage": "A4DC",
      "articleFour.newcastle.hmoOne": "A4HMO1",
      "articleFour.newcastle.hmoTwo": "A4HMO2",
      "articleFour.newcastle.hmoThree": "A4HMO3",
      "articleFour.newcastle.northumberlandGardens": "A4NG",
      "articleFour.newcastle.northumberlandGardensTwo": "A4NG/E",
      "articleFour.newcastle.saintPetersBasinOne": "A4SPBa1",
      "articleFour.newcastle.saintPetersBasinTwo": "A4SPBa2",
      "articleFour.newcastle.saintPetersBasinThree": "A4SPBa3",
      "articleFour.newcastle.saintPetersBasinFour": "A4SPBa4",
      "articleFour.newcastle.saintPetersBasinFive": "A4SPBa5",
      "articleFour.newcastle.summerhill": "A4SH",
    },
  },
};

export { planningConstraints };
