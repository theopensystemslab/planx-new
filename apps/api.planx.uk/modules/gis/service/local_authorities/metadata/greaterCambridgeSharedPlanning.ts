/*
LAD20CD: E07000008 & E07000012
LAD20NM: Cambridge & South Cambridgeshire
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&organisation_entity=70&organisation_entity=281&limit=10
https://docs.google.com/spreadsheets/d/1n9zM0HyIHfHxBx-_QmFHuNl0jgxcAoG3vBwc1yq6zeQ/edit?gid=0#gid=0
*/

import type { LocalAuthorityMetadata } from "../../helpers.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to entity.reference on Planning Data
    records: {
      "articleFour.greaterCambridgeSharedPlanning.article10": "ARTICLE/10",
      "articleFour.greaterCambridgeSharedPlanning.article20": "ARTICLE/20",
      "articleFour.greaterCambridgeSharedPlanning.article30": "ARTICLE/30",
      "articleFour.greaterCambridgeSharedPlanning.article40": "ARTICLE/40",
      "articleFour.greaterCambridgeSharedPlanning.article50": "ARTICLE/50",
      "articleFour.greaterCambridgeSharedPlanning.article60": "ARTICLE/60",
      "articleFour.greaterCambridgeSharedPlanning.article70": "ARTICLE/70",
      "articleFour.greaterCambridgeSharedPlanning.article80": "ARTICLE/80",
      "articleFour.greaterCambridgeSharedPlanning.article90": "ARTICLE/90",
      "articleFour.greaterCambridgeSharedPlanning.article100": "ARTICLE/100",
      "articleFour.greaterCambridgeSharedPlanning.article110": "ARTICLE/110",
      "articleFour.greaterCambridgeSharedPlanning.article120": "ARTICLE/120",
      "articleFour.greaterCambridgeSharedPlanning.article130": "ARTICLE/130",
      "articleFour.greaterCambridgeSharedPlanning.article140": "ARTICLE/140",
      "articleFour.greaterCambridgeSharedPlanning.article150": "ARTICLE/150",
      "articleFour.greaterCambridgeSharedPlanning.article160": "ARTICLE/160",
      "articleFour.greaterCambridgeSharedPlanning.article170": "ARTICLE/170",
      "articleFour.greaterCambridgeSharedPlanning.article180": "ARTICLE/180",
      "articleFour.greaterCambridgeSharedPlanning.article190": "ARTICLE/190",
      "articleFour.greaterCambridgeSharedPlanning.article200": "ARTICLE/200",
      "articleFour.greaterCambridgeSharedPlanning.article210": "ARTICLE/210",
      "articleFour.greaterCambridgeSharedPlanning.article220": "ARTICLE/220",
      "articleFour.greaterCambridgeSharedPlanning.article230": "ARTICLE/230",
      "articleFour.greaterCambridgeSharedPlanning.article240": "ARTICLE/240",
      "articleFour.greaterCambridgeSharedPlanning.article250": "ARTICLE/250",
      "articleFour.greaterCambridgeSharedPlanning.article260": "ARTICLE/260",
      "articleFour.greaterCambridgeSharedPlanning.article270": "ARTICLE/270",
      "articleFour.greaterCambridgeSharedPlanning.article280": "ARTICLE/280",
    },
  },
};

export { planningConstraints };
