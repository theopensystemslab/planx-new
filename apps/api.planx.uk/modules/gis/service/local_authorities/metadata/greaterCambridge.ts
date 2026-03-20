/*
LAD20CD: E07000008 & E07000012
LAD20NM: Cambridge & South Cambridgeshire
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&organisation_entity=70&organisation_entity=281&limit=10
https://docs.google.com/spreadsheets/d/1n9zM0HyIHfHxBx-_QmFHuNl0jgxcAoG3vBwc1yq6zeQ/edit?gid=0#gid=0
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to entity.reference on Planning Data
    records: {
      "articleFour.greaterCambridge.article10": "ARTICLE/10",
      "articleFour.greaterCambridge.article20": "ARTICLE/20",
      "articleFour.greaterCambridge.article30": "ARTICLE/30",
      "articleFour.greaterCambridge.article40": "ARTICLE/40",
      "articleFour.greaterCambridge.article50": "ARTICLE/50",
      "articleFour.greaterCambridge.article60": "ARTICLE/60",
      "articleFour.greaterCambridge.article70": "ARTICLE/70",
      "articleFour.greaterCambridge.article80": "ARTICLE/80",
      "articleFour.greaterCambridge.article90": "ARTICLE/90",
      "articleFour.greaterCambridge.article100": "ARTICLE/100",
      "articleFour.greaterCambridge.article110": "ARTICLE/110",
      "articleFour.greaterCambridge.article120": "ARTICLE/120",
      "articleFour.greaterCambridge.article130": "ARTICLE/130",
      "articleFour.greaterCambridge.article140": "ARTICLE/140",
      "articleFour.greaterCambridge.article150": "ARTICLE/150",
      "articleFour.greaterCambridge.article160": "ARTICLE/160",
      "articleFour.greaterCambridge.article170": "ARTICLE/170",
      "articleFour.greaterCambridge.article180": "ARTICLE/180",
      "articleFour.greaterCambridge.article190": "ARTICLE/190",
      "articleFour.greaterCambridge.article200": "ARTICLE/200",
      "articleFour.greaterCambridge.article210": "ARTICLE/210",
      "articleFour.greaterCambridge.article220": "ARTICLE/220",
      "articleFour.greaterCambridge.article230": "ARTICLE/230",
      "articleFour.greaterCambridge.article240": "ARTICLE/240",
      "articleFour.greaterCambridge.article250": "ARTICLE/250",
      "articleFour.greaterCambridge.article260": "ARTICLE/260",
      "articleFour.greaterCambridge.article270": "ARTICLE/270",
      "articleFour.greaterCambridge.article280": "ARTICLE/280",
    },
  },
};

export { planningConstraints };
