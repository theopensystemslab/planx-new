/*
LAD20CD: E09000003
LAD20NM: Barnet
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE09000003&entry_date_day=&entry_date_month=&entry_date_year=
https://docs.google.com/spreadsheets/d/1ZjqYdC7upA8YS9rBoyRIQPT1sqCXJBaxQDrvUh1todU/edit#gid=0
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to Digital Land article-4-direction and entity.reference
    records: {
      "articleFour.barnet.finchleyChurchEnd": "A4D1",
      "articleFour.barnet.finchleyGardenVillage": "A4D2A1",
      "articleFour.barnet.glenhillClose": "A4D3A1",
      "articleFour.barnet.hendonBurroughs.one": "A4D5A1",
      "articleFour.barnet.hendonBurroughs.two": "A4D5A2",
      "articleFour.barnet.hampsteadGardenSuburb": "A4D4A1",
      "articleFour.barnet.spaniardsEnd": "	A4D4A2",
      "articleFour.barnet.millHillA": "A4D6",
      "articleFour.barnet.millHillB": "A4D7",
      "articleFour.barnet.monkenHadleyA": "A4D8",
      "articleFour.barnet.monkenHadleyB": "A4D9",
      "articleFour.barnet.mossHall": "A4D10",
      "articleFour.barnet.totteridgeA": "A4D11",
      "articleFour.barnet.totteridgeB": "A4D12",
      "articleFour.barnet.woodStreet": "A4D13",
      "articleFour.barnet.hmo": "A4D14",
      "articleFour.barnet.agriculturalLand": "A4D15",
    },
  },
};

export { planningConstraints };
