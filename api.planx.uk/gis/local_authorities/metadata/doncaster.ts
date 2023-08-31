/*
LAD20CD: E08000017
LAD20NM: Doncaster
LAD20NMW:
FID:

https://maps.doncaster.gov.uk/portal/apps/webappviewer/index.html?id=2435bce5ee1a41ff8ddb9e06d30bf35a
https://www.doncaster.gov.uk/services/planning/houses-in-multiple-occupation-article-4-direction
*/

import { LocalAuthorityMetadata } from "../../digitalLand";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  article4: {
    // Planx granular values link to Digital Land entity.reference
    records: {
      "article4.doncaster.hmo": "Article 4 (HMO) Boundary", // https://www.planning.data.gov.uk/entity/6100030/
      "article4.doncaster.demolition": "Article 4 (DSA) Boundary", // https://www.planning.data.gov.uk/entity/6100031/
    },
  },
};

export { planningConstraints };
