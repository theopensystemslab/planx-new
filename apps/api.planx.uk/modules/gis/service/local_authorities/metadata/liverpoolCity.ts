/*
LAD20CD: E08000012
LAD20NM: Liverpool
LAD20NMW:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE08000012&q=&entry_date_day=&entry_date_month=&entry_date_year=
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // These entries include large properties with 'historic planning conditions'
    records: {
      "articleFour.liverpool.liverpoolDirection": "A4Da407",
      "articleFour.liverpool.dales": "A4Da408",
      "articleFour.liverpool.waltonTriangle": "A4Da325",
      "articleFour.liverpool.croxtethPark": "A4Da327",
      "articleFour.liverpool.cravenWood": "A4Da339",
      "articleFour.liverpool.liverpoolTwelve": "A4Da341",
      "articleFour.liverpool.riverDrive": "A4Da392",
      "articleFour.liverpool.dakotaDrive": "A4Da1242",
      "articleFour.liverpool.newMersey": "A4Da1190",
      "articleFour.liverpool.festivalSite.one": "A4Da711",
      "articleFour.liverpool.festivalSite.two": "A4Da850",
      "articleFour.liverpool.projectJennifer.one": "A4Da638",
      "articleFour.liverpool.projectJennifer.two": "A4Da784",
      "articleFour.liverpool.airport.one": "A4Da664",
      "articleFour.liverpool.airport.two": "A4Da792",
      "articleFour.liverpool.businessPark": "A4Da584",
    },
  },
};

export { planningConstraints };
