/*
LAD20CD: E09000028
LAD20NM: Southwark
LAD20NMW:
FID: 358

https://geo.southwark.gov.uk/connect/analyst/mobile/#/main
https://environment.data.gov.uk/arcgis/rest/services
*/

import { LocalAuthorityMetadata } from "../../digitalLand";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  article4: {
    // Planx granular values link to Southwark's source data in the following ways:
    //   * exact match of Digital Land entity.json.description (aka "ARTICLE_4_DIRECTION" in source data)
    records: {
      "article4.southwark.sunray":
        "External alterations to buildings are restricted",
      "article4.southwark.publichouse":
        "Change of use, demolition or alteration of pubs is restricted",
      "article4.southwark.hmo":
        "Change of use from self contained dwelling houses is restricted",
      "article4.southwark.MA":
        "Change of use from Class E to residential is restricted",
      "article4.southwark.railway": "Demolition on the site restricted",
      "article4.southwark.southernrail":
        "Conversion of railway arches to residential dwellings is restricted",
    },
  },
};

export { planningConstraints };
