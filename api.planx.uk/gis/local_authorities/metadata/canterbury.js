/*
LAD20CD: E07000106
LAD20NM: Canterbury
LAD20NMW:
FID: 285

https://opendata.canterbury.gov.uk/
https://mapping.canterbury.gov.uk/arcgis/rest/services/
https://environment.data.gov.uk/arcgis/rest/services
*/

const planningConstraints = {
  article4: {
    // Planx granular values link to Canterbury's source data in the following ways:
    //   * exact match of Digital Land entity.reference if HMO Article 4 (aka "REF" in source data)
    //   * exact match of DL entity.json.notes if non-HMO (aka "REF" in source data)
    records: {
      "article4.canterbury.adisham.a": "Article 4 Direction No 6 2003",
      "article4.canterbury.adisham.b": "Article 4 Direction No 15 2003",
      "article4.canterbury.barham.a": "Article 4 Direction No 3 2003",
      "article4.canterbury.barham.b": "Article 4 Direction No 17 2003",
      "article4.canterbury.barham.c": "Article 4 Direction No 31 2003",
      "article4.canterbury.bishopsbourne": "Article 4 Direction No 4 2003",
      "article4.canterbury.blean.a": "Article 4 Direction No 5 2003",
      "article4.canterbury.blean.b": "Article 4 Direction No 2 2003",
      "article4.canterbury.bridge": "Article 4 Direction No 10 2003",
      "article4.canterbury.brookfield": "ARTICLE 4",
      "article4.canterbury.chartham": "Article 4 Direction No 12 2003",
      "article4.canterbury.chestfield": "Article 4 Direction No 13 2003",
      "article4.canterbury.chisit.a": "Article 4 Direction No 23 2003",
      "article4.canterbury.chisit.b": "Article 4 Direction No 8 2003",
      "article4.canterbury.city": "Article 4 Direction 1985",
      "article4.canterbury.denstroude.a": "Article 4 Direction No 2 1993",
      "article4.canterbury.denstroude.b": "Article 4 Direction No 1 1993",
      "article4.canterbury.fordwich": "Article 4 Direction No 19 2003",
      "article4.canterbury.fourAcres": "Article 4 Direction No 1 1994",
      "article4.canterbury.graveneyMarshes": "Article 4 Direction No 3 1976",
      "article4.canterbury.hackington": "Article 4 Direction No 37 2003",
      "article4.canterbury.harbledown.a": "Article 4 Direction No 21 2003",
      "article4.canterbury.harbledown.b": "Article 4 Direction No 11 2003",
      "article4.canterbury.herne": "Article 4 Direction No 22 2003",
      "article4.canterbury.herneBay": "Article 4 Direction 1997 - Her",
      "article4.canterbury.hmo": "The Canterbury HMO Article 4 D",
      "article4.canterbury.hoath.a": "Article 4 Direction No 18 2003",
      "article4.canterbury.hoath.b": "Article 4 Direction No 24 2003",
      "article4.canterbury.ickham.a": "Article 4 Direction No 25 2003",
      "article4.canterbury.ickham.b": "Article 4 Direction No 27 2003",
      "article4.canterbury.ickhamWickhambreaux":
        "Article 4 Direction No 9 2003",
      "article4.canterbury.kemberlandWood": "Article 4 Direction No 1 1979",
      "article4.canterbury.kingston": "Article 4 Direction No 26 2003",
      "article4.canterbury.littlebourne": "Article 4 Direction No 28 2003",
      "article4.canterbury.lovelane": "Article 4 Direction 1985",
      "article4.canterbury.lowerHardres": "Article 4 Direction No 29 2003",
      "article4.canterbury.mountsWoods": "Article 4 Direction 1995",
      "article4.canterbury.nackington": "Article 4 Direction No 30 2003",
      "article4.canterbury.nelsonRoad": "Article 4 Direction, 1985",
      "article4.canterbury.patrixbourne": "Article 4 Direction No 2 2004",
      "article4.canterbury.pennyPot": "Article 4 Direction No 1 1976",
      "article4.canterbury.petham.a": "Article 4 Direction No 20 2003",
      "article4.canterbury.petham.b": "Article 4 Direction No 32 2003",
      "article4.canterbury.sandpitWood": "Article 4 Direction 1989",
      "article4.canterbury.southWhitstable": "Article 4 Direction No 33 2003",
      "article4.canterbury.stMartinsHospital.a":
        "Article 4 Direction No 1 2004",
      "article4.canterbury.stMartinsHospital.b":
        "Article 4 Direction No 1 2004",
      "article4.canterbury.stodmarsh": "Article 4 Direction No 35 2003",
      "article4.canterbury.sturry": "Article 4 Direction No 36 2003",
      "article4.canterbury.tylerHill": "Article 4 Direction No 37 2003",
      "article4.canterbury.upperHarbledown": "Article 4 Direction No 38 2003",
      "article4.canterbury.upperHardres.a": "Article 4 Direction No 39 2003",
      "article4.canterbury.upperHardres.b": "Article 4 Direction No 7 2003",
      "article4.canterbury.vikingsEstate": "Article 4 Direction No 1 1972",
      "article4.canterbury.walderchainWood.a": "Article 4 Direction No 1 1991",
      "article4.canterbury.walderchainWood.b": "Article 4 Direction No 2 1991",
      "article4.canterbury.waltham": "Article 4 Direction No 40 2003",
      "article4.canterbury.watermill": "Article 4 Direction 1986",
      "article4.canterbury.westbere": "Article 4 Direction No 41 2003",
      "article4.canterbury.whitstable.a": "Article 4 Direction No 14 2003",
      "article4.canterbury.whitstable.b": "Article 4 Direction No 33 2003",
      "article4.canterbury.whitstableBeach": "Article 4 Direction 2003",
      "article4.canterbury.whitstableConservation":
        "Article 4 Direction 1996 - Whi",
      "article4.canterbury.womenswold.a": "Article 4 Direction No 16 2003",
      "article4.canterbury.womenswold.b": "Article 4 Direction No 42 2003",
      "article4.canterbury.yorkletts": "Article 4 Direction No 2 1976",
    },
  },
};

export { planningConstraints };
