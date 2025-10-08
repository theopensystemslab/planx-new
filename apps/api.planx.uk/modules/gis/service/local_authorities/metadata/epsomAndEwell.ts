/*
LAD20CD: E07000208
LAD20NM: Epsom and Ewell
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE07000208&entry_date_day=&entry_date_month=&entry_date_year=
https://docs.google.com/spreadsheets/d/1BzYZ_YvJjOrY2afxPGWbPvV2g_FLBr0H/edit#gid=125611981
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to Digital Land article-4-direction and entity.reference
    records: {
      "articleFour.epsomAndEwell.burghheath": "11/00003/ART4",
      "articleFour.epsomAndEwell.churchstreet": "11/00004/ART4",
      "articleFour.epsomAndEwell.college": "11/00005/ART4",
      "articleFour.epsomAndEwell.downs": "11/00006/ART4",
      "articleFour.epsomAndEwell.ewellvillage": "11/00002/ART4",
      "articleFour.epsomAndEwell.highergreenlongdown": "05/00002/ART4",
      "articleFour.epsomAndEwell.lintons": "11/00007/ART4",
      "articleFour.epsomAndEwell.pikes": "12/00002/ART4",
      "articleFour.epsomAndEwell.pikesPart": "11/00008/ART4",
      "articleFour.epsomAndEwell.stamfordgreen": "05/00001/ART4",
      "articleFour.epsomAndEwell.greenewelldowns": "05/00004/ART4",
      "articleFour.epsomAndEwell.worple": "11/00009/ART4",
      "articleFour.epsomAndEwell.adelphi": "16/00008/ART4",
      "articleFour.epsomAndEwell.aplanhouse": "16/00013/ART4",
      "articleFour.epsomAndEwell.bradfordhouse": "16/00013/ART4",
      "articleFour.epsomAndEwell.eastleighhouse": "16/00005/ART4",
      "articleFour.epsomAndEwell.emeraldhouse": "16/00009/ART4",
      "articleFour.epsomAndEwell.epsomchase": "16/00004/ART4",
      "articleFour.epsomAndEwell.epsomgateway": "16/00015/ART4",
      "articleFour.epsomAndEwell.globalhouse": "16/00016/ART4",
      "articleFour.epsomAndEwell.horizonhouse": "16/00012/ART4",
      "articleFour.epsomAndEwell.newplanhouse": "16/00006/ART4",
      "articleFour.epsomAndEwell.nightingalehouse": "16/00007/ART4",
      "articleFour.epsomAndEwell.oakshouse": "16/00014/ART4",
      "articleFour.epsomAndEwell.parksidehouse": "16/00017/ART4",
      "articleFour.epsomAndEwell.sollishouse": "16/00011/ART4",
      "articleFour.epsomAndEwell.thekirkgate": "16/00019/ART4",
      "articleFour.epsomAndEwell.thewells": "16/00018/ART4",
    },
  },
};

export { planningConstraints };
