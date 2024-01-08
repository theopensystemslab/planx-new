/*
LAD20CD: E09000003
LAD20NM: Barnet
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE09000003&entry_date_day=&entry_date_month=&entry_date_year=
https://docs.google.com/spreadsheets/d/1ZjqYdC7upA8YS9rBoyRIQPT1sqCXJBaxQDrvUh1todU/edit#gid=0
*/

import { LocalAuthorityMetadata } from "../../digitalLand";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  article4: {
    // Planx granular values link to Digital Land article-4-direction and entity.reference
    records: {
      "article4.barnet.finchleyChurchEnd": "A4D1",
      "article4.barnet.finchleyGardenVillage": "A4D2A1",
      "article4.barnet.glenhillClose": "A4D3A1",
      "article4.barnet.hendonBurroughs.1": "A4D5A1",
      "article4.barnet.hendonBurroughs.2": "A4D5A2",
      "article4.barnet.hampsteadGardenSuburb": "A4D4A1",
      "article4.barnet.spaniardsEnd": "	A4D4A2",
      "article4.barnet.millHillA": "A4D6",
      "article4.barnet.millHillB": "A4D7",
      "article4.barnet.monkenHadleyA": "A4D8",
      "article4.barnet.monkenHadleyB": "A4D9",
      "article4.barnet.mossHall": "A4D10",
      "article4.barnet.totteridgeA": "A4D11",
      "article4.barnet.totteridgeB": "A4D12",
      "article4.barnet.woodStreet": "A4D13",
      "article4.barnet.hmo": "A4D14",
      "article4.barnet.agriculturalLand": "A4D15",
    },
  },
};

export { planningConstraints };
