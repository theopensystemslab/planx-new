/*
LAD20CD: E09000022
LAD20NM: Lambeth
LAD20NMW:
FID: 352

https://lambethopenmappingdata-lambethcouncil.opendata.arcgis.com/
https://gis.lambeth.gov.uk/arcgis/rest/services
https://environment.data.gov.uk/arcgis/rest/services
*/

import { LocalAuthorityMetadata } from "../../digitalLand";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  article4: {
    // Planx granular values link to Lambeth's source data in the following ways:
    //   * exact match of Digital Land entity.name (aka "NAME" in source data)
    //   * exact match of DL entity.json.notes if "B1toC3" layer ("ARTICLE_4" in source data)
    records: {
      "article4.lambeth.streathamLodge": "STREATHAM LODGE ESTATE", // CA62
      "article4.lambeth.stockwell": "STOCKWELL PARK", // CA05
      "article4.lambeth.leigham": "LEIGHAM COURT ESTATE", // CA31
      "article4.lambeth.stMarks": "ST MARKS", // CA11
      "article4.lambeth.hanover": "ST MARKS/HANOVER GARDENS", // CA11
      "article4.lambeth.parkHall": "PARK HALL ROAD", // CA19
      "article4.lambeth.lansdowne": "LANSDOWNE GARDENS", // CA03
      "article4.lambeth.albert": "ALBERT SQUARE", // CA04
      "article4.lambeth.hydeFarm": "HYDE FARM", // CA48
      "article4.lambeth.kiba": "KIBA", // ARTICLE_4 match on B1toC3 dataset
      "article4.lambeth.kiba.clapham": "Clapham", // ARTICLE_4 match on B1toC3 dataset
      "article4.lambeth.kiba.brixton": "Brixton", // ARTICLE_4 match on B1toC3 dataset
    },
  },
};

export {
  planningConstraints,
};
