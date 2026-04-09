/*
LAD20NM: Brent
LAD20CD: E09000005
https://drive.google.com/drive/folders/1ImyKADCOaYz9pljKyjs3cLWiiWxaI5HF
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    records: {
      "articleFour.brent.hmo": "A4D_HMO",
      "articleFour.brent.ca": "A4D_CA",
      "articleFour.brent.caTwo": "A4D_CA2",
      "articleFour.brent.caNine": "A4D_CA9",
      "articleFour.brent.rb": "A4D_RB",
      "articleFour.brent.sl": "A4D_SL",
      "articleFour.brent.sa": "A4D_SA",
      "articleFour.brent.tc": "A4D_TC",
    },
  },
};

export { planningConstraints };
