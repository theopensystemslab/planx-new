/*
LAD20CD: E09000028
LAD20NM: Southwark
LAD20NMW:
FID: 358

https://geo.southwark.gov.uk/connect/analyst/mobile/#/main
https://environment.data.gov.uk/arcgis/rest/services
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to Southwark's source data in the following ways:
    //   * exact match of Digital Land entity.json.description (aka "ARTICLE_4_DIRECTION" in source data)
    records: {
      "articleFour.southwark.sunray":
        "External alterations to buildings are restricted",
      "articleFour.southwark.publichouse":
        "Change of use, demolition or alteration of pubs is restricted",
      "articleFour.southwark.hmo":
        "Change of use from self contained dwelling houses is restricted",
      "articleFour.southwark.MA":
        "Change of use from Class E to residential is restricted",
      "articleFour.southwark.railway": "Demolition on the site restricted",
      "articleFour.southwark.southernrail":
        "Conversion of railway arches to residential dwellings is restricted",
    },
  },
};

export { planningConstraints };
