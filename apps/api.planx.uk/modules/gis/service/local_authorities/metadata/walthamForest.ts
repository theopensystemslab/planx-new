/*
LAD20CD: E09000031
LAD20NM: Waltham Forest
LAD20NMW:
FID:
*/

import type { LocalAuthorityMetadata } from "../../helpers.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to Digital Land article-4-direction dataset
    records: {
      "articleFour.walthamForest.otherRefOne": "A4DocRef1",
      "articleFour.walthamForest.boroughEmployment": "A4DocRef2",
      "articleFour.walthamForest.otherRefThree": "A4DocRef3",
      "articleFour.walthamForest.districtCentre": "A4DocRef4",
      "articleFour.walthamForest.browningRoad": "A4DocRef5",
      "articleFour.walthamForest.chingfordGreen": "A4DocRef6",
      "articleFour.walthamForest.forestSchool": "A4DocRef7",
      "articleFour.walthamForest.higham": "A4DocRef8",
      "articleFour.walthamForest.otherRefNine": "A4DocRef9",
      "articleFour.walthamForest.leytonstone": "A4DocRef10",
      "articleFour.walthamForest.orfordRoad": "A4DocRef11",
      "articleFour.walthamForest.ropersField": "A4DocRef12",
      "articleFour.walthamForest.thornhillRoad": "A4DocRef13",
      "articleFour.walthamForest.walthamstowVillage": "A4DocRef14",
      "articleFour.walthamForest.woodfordGreen": "A4DocRef15",
    },
  },
};

export { planningConstraints };
