/*
LAD20CD: E06000027
LAD20NM: Torbay
LAD20NMW:
FID:

https://docs.google.com/spreadsheets/d/14-a74XcdqfZku5Dbp6NkrlPFu-wlAX5R/edit?gid=517562037#gid=517562037
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    records: {
      "articleFour.torbay.polsham": "POLA4",
      "articleFour.torbay.churston": "CHUA4",
    },
  },
};

export { planningConstraints };
