/*
LAD20CD: E06000037
LAD20NM: West Berkshire
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE06000037&entry_date_day=&entry_date_month=&entry_date_year=#51.47483223935322,-1.0401689836322703,17.030900256454515z
https://docs.google.com/spreadsheets/d/1dRTb8xhcJgsQB8zIFregenm5aEzrZGU_/edit#gid=322896440
*/

import { LocalAuthorityMetadata } from "../../digitalLand";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  article4: {
    // Planx granular values link to Digital Land article-4-direction and entity.reference
    records: {
      "article4.westBerkshire.oxfordroad": "23/00295/ART4",
      "article4.westBerkshire.theobalddrive": "23/00294/ART4",
      "article4.westBerkshire.hollies": "23/00293/ART4",
      "article4.westBerkshire.bridleway": "23/00292/ART4",
      "article4.westBerkshire.sawmills": "22/00011/ART4",
      "article4.westBerkshire.fordsfarmestate": "23/00291/ART4",
      "article4.westBerkshire.hollybushlane": "22/00012/ART4",
      "article4.westBerkshire.shawroad": "23/00296/ART4",
      "article4.westBerkshire.eastgarston": "22/00010/ART4",
    },
  },
};

export { planningConstraints };
