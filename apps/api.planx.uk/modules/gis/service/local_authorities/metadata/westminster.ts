/*
LAD20CD: E09000033
LAD20NM: Westminster
LAD20NMW:
FID:
*/

import type { LocalAuthorityMetadata } from "../../helpers.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to Digital Land article-4-direction dataset
    records: {
      "articleFour.westminster.reltonMews": "REG_4/36800",
      "articleFour.westminster.bridstowPlace": "REG_4/36840",
      "articleFour.westminster.bristolGardens": "REG_4/36860",
      "articleFour.westminster.abbeyGardens": "REG/36850",
      "articleFour.westminster.sussexGardens": "REG_4/36890",
      "articleFour.westminster.moncorvoClose": "REG_4/36780",
      "articleFour.westminster.basement": "23/00006/REG_4",
      "articleFour.westminster.caz": "23/00004/REG_4",
      "articleFour.westminster.townCentres": "23/00005/REG_4",
      "articleFour.westminster.queensParkEstate": "REG_4/36880",
    },
  },
};

export { planningConstraints };
