/*
LAD20CD: E08000017
LAD20NM: Doncaster
LAD20NMW:
FID:

https://maps.doncaster.gov.uk/portal/apps/webappviewer/index.html?id=2435bce5ee1a41ff8ddb9e06d30bf35a
https://www.doncaster.gov.uk/services/planning/houses-in-multiple-occupation-article-4-direction
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to Digital Land entity.reference
    records: {
      "articleFour.doncaster.hmo": "Article 4 (HMO) Boundary - Came into force 14 October 2019",
      "articleFour.doncaster.demolition": "Article 4 (DSA) Boundary - Came into force 25 July 2024",
    },
  },
};

export { planningConstraints };
