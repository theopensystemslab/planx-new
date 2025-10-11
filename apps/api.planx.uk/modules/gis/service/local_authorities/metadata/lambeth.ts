/*
LAD20CD: E09000022
LAD20NM: Lambeth
LAD20NMW:
FID: 352

https://lambethopenmappingdata-lambethcouncil.opendata.arcgis.com/
https://gis.lambeth.gov.uk/arcgis/rest/services
https://environment.data.gov.uk/arcgis/rest/services
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to Lambeth's source data in the following ways:
    //   * exact match of Digital Land entity.name (aka "NAME" in source data)
    //   * exact match of DL entity.json.notes if "B1toC3" layer ("ARTICLE_4" in source data)
    records: {
      "articleFour.lambeth.streathamLodge": "STREATHAM LODGE ESTATE", // CA62
      "articleFour.lambeth.stockwell": "STOCKWELL PARK", // CA05
      "articleFour.lambeth.leigham": "LEIGHAM COURT ESTATE", // CA31
      "articleFour.lambeth.stMarks": "ST MARKS", // CA11
      "articleFour.lambeth.hanover": "ST MARKS/HANOVER GARDENS", // CA11
      "articleFour.lambeth.parkHall": "PARK HALL ROAD", // CA19
      "articleFour.lambeth.lansdowne": "LANSDOWNE GARDENS", // CA03
      "articleFour.lambeth.albert": "ALBERT SQUARE", // CA04
      "articleFour.lambeth.hydeFarm": "HYDE FARM", // CA48
      "articleFour.lambeth.kiba": "KIBA", // ARTICLE_4 match on B1toC3 dataset
      "articleFour.lambeth.kiba.clapham": "Clapham", // ARTICLE_4 match on B1toC3 dataset
      "articleFour.lambeth.kiba.brixton": "Brixton", // ARTICLE_4 match on B1toC3 dataset
    },
  },
};

export { planningConstraints };
