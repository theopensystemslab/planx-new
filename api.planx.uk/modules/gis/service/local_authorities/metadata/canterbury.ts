/*
LAD20CD: E07000106
LAD20NM: Canterbury
LAD20NMW:
FID: 285

https://opendata.canterbury.gov.uk/
https://mapping.canterbury.gov.uk/arcgis/rest/services/
https://environment.data.gov.uk/arcgis/rest/services
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to Canterbury's source data in the following ways:
    //   * exact match of Digital Land entity.reference if HMO Article 4 (aka "REF" in source data)
    //   * exact match of DL entity.json.notes if non-HMO (aka "REF" in source data)
    records: {
      "articleFour.canterbury.adisham.a": "Article 4 Direction No 6 2003",
      "articleFour.canterbury.adisham.b": "Article 4 Direction No 15 2003",
      "articleFour.canterbury.barham.a": "Article 4 Direction No 3 2003",
      "articleFour.canterbury.barham.b": "Article 4 Direction No 17 2003",
      "articleFour.canterbury.barham.c": "Article 4 Direction No 31 2003",
      "articleFour.canterbury.bishopsbourne": "Article 4 Direction No 4 2003",
      "articleFour.canterbury.blean.a": "Article 4 Direction No 5 2003",
      "articleFour.canterbury.blean.b": "Article 4 Direction No 2 2003",
      "articleFour.canterbury.bridge": "Article 4 Direction No 10 2003",
      "articleFour.canterbury.brookfield": "ARTICLE 4",
      "articleFour.canterbury.chartham": "Article 4 Direction No 12 2003",
      "articleFour.canterbury.chestfield": "Article 4 Direction No 13 2003",
      "articleFour.canterbury.chisit.a": "Article 4 Direction No 23 2003",
      "articleFour.canterbury.chisit.b": "Article 4 Direction No 8 2003",
      "articleFour.canterbury.city": "Article 4 Direction 1985",
      "articleFour.canterbury.denstroude.a": "Article 4 Direction No 2 1993",
      "articleFour.canterbury.denstroude.b": "Article 4 Direction No 1 1993",
      "articleFour.canterbury.fordwich": "Article 4 Direction No 19 2003",
      "articleFour.canterbury.fourAcres": "Article 4 Direction No 1 1994",
      "articleFour.canterbury.graveneyMarshes": "Article 4 Direction No 3 1976",
      "articleFour.canterbury.hackington": "Article 4 Direction No 37 2003",
      "articleFour.canterbury.harbledown.a": "Article 4 Direction No 21 2003",
      "articleFour.canterbury.harbledown.b": "Article 4 Direction No 11 2003",
      "articleFour.canterbury.herne": "Article 4 Direction No 22 2003",
      "articleFour.canterbury.herneBay": "Article 4 Direction 1997 - Her",
      "articleFour.canterbury.hmo": "The Canterbury HMO Article 4 D",
      "articleFour.canterbury.hoath.a": "Article 4 Direction No 18 2003",
      "articleFour.canterbury.hoath.b": "Article 4 Direction No 24 2003",
      "articleFour.canterbury.ickham.a": "Article 4 Direction No 25 2003",
      "articleFour.canterbury.ickham.b": "Article 4 Direction No 27 2003",
      "articleFour.canterbury.ickhamWickhambreaux":
        "Article 4 Direction No 9 2003",
      "articleFour.canterbury.kemberlandWood": "Article 4 Direction No 1 1979",
      "articleFour.canterbury.kingston": "Article 4 Direction No 26 2003",
      "articleFour.canterbury.littlebourne": "Article 4 Direction No 28 2003",
      "articleFour.canterbury.lovelane": "Article 4 Direction 1985",
      "articleFour.canterbury.lowerHardres": "Article 4 Direction No 29 2003",
      "articleFour.canterbury.mountsWoods": "Article 4 Direction 1995",
      "articleFour.canterbury.nackington": "Article 4 Direction No 30 2003",
      "articleFour.canterbury.nelsonRoad": "Article 4 Direction, 1985",
      "articleFour.canterbury.patrixbourne": "Article 4 Direction No 2 2004",
      "articleFour.canterbury.pennyPot": "Article 4 Direction No 1 1976",
      "articleFour.canterbury.petham.a": "Article 4 Direction No 20 2003",
      "articleFour.canterbury.petham.b": "Article 4 Direction No 32 2003",
      "articleFour.canterbury.sandpitWood": "Article 4 Direction 1989",
      "articleFour.canterbury.southWhitstable":
        "Article 4 Direction No 33 2003",
      "articleFour.canterbury.stMartinsHospital.a":
        "Article 4 Direction No 1 2004",
      "articleFour.canterbury.stMartinsHospital.b":
        "Article 4 Direction No 1 2004",
      "articleFour.canterbury.stodmarsh": "Article 4 Direction No 35 2003",
      "articleFour.canterbury.sturry": "Article 4 Direction No 36 2003",
      "articleFour.canterbury.tylerHill": "Article 4 Direction No 37 2003",
      "articleFour.canterbury.upperHarbledown":
        "Article 4 Direction No 38 2003",
      "articleFour.canterbury.upperHardres.a": "Article 4 Direction No 39 2003",
      "articleFour.canterbury.upperHardres.b": "Article 4 Direction No 7 2003",
      "articleFour.canterbury.vikingsEstate": "Article 4 Direction No 1 1972",
      "articleFour.canterbury.walderchainWood.a":
        "Article 4 Direction No 1 1991",
      "articleFour.canterbury.walderchainWood.b":
        "Article 4 Direction No 2 1991",
      "articleFour.canterbury.waltham": "Article 4 Direction No 40 2003",
      "articleFour.canterbury.watermill": "Article 4 Direction 1986",
      "articleFour.canterbury.westbere": "Article 4 Direction No 41 2003",
      "articleFour.canterbury.whitstable.a": "Article 4 Direction No 14 2003",
      "articleFour.canterbury.whitstable.b": "Article 4 Direction No 33 2003",
      "articleFour.canterbury.whitstableBeach": "Article 4 Direction 2003",
      "articleFour.canterbury.whitstableConservation":
        "Article 4 Direction 1996 - Whi",
      "articleFour.canterbury.womenswold.a": "Article 4 Direction No 16 2003",
      "articleFour.canterbury.womenswold.b": "Article 4 Direction No 42 2003",
      "articleFour.canterbury.yorkletts": "Article 4 Direction No 2 1976",
    },
  },
};

export { planningConstraints };
