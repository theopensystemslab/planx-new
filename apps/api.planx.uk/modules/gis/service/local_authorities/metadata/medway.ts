/*
LAD20CD: E06000035
LAD20NM: Medway
LAD20NMW:
FID: 

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE06000035&entries=all&entry_date_day=&entry_date_month=&entry_date_year=
https://trello.com/c/cpNv0iyO/42-input-your-article-4-direction-information-into-this-spreadsheet
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to Medways's source data in the following ways:
    //   * exact match of Digital Land's entity.reference
    records: {
      "articleFour.medway.bromptonLines.one": "BR01",
      "articleFour.medway.bromptonLines.two": "BR02",
      "articleFour.medway.chathamBrompton": "CCBROM",
      "articleFour.medway.elmhavenMarina": "ELM01",
      "articleFour.medway.gillinghamPark": "GILL01",
      "articleFour.medway.gillinghamSouth": "GILSOU",
      "articleFour.medway.gillinghamNorth": "GILNOR",
      "articleFour.medway.historicRochester.one": "ROC01",
      "articleFour.medway.historicRochester.two": "ROC02",
      "articleFour.medway.historicRochester.three": "ROC03",
      "articleFour.medway.historicRochester.four": "ROC04",
      "articleFour.medway.historicRochester.five": "ROC05",
      "articleFour.medway.historicRochester.six": "ROC06",
      "articleFour.medway.historicRochester.seven": "ROC07",
      "articleFour.medway.historicRochester.eight": "ROC08",
      "articleFour.medway.historicRochester.nine": "ROC09",
      "articleFour.medway.historicRochester.ten": "ROC10",
      "articleFour.medway.historicRochester.eleven": "ROC11",
      "articleFour.medway.historicRochester.twelve": "ROC12",
      "articleFour.medway.historicRochester.thirteen": "ROC13",
      "articleFour.medway.historicRochester.fourteen": "ROC14",
      "articleFour.medway.luton": "LUTON",
      "articleFour.medway.maidstoneRoad": "MAI01",
      "articleFour.medway.newRoad.one": "NEWRD01",
      "articleFour.medway.newRoad.two": "NEWRD02",
      "articleFour.medway.newRoad.three": "NEWRD03",
      "articleFour.medway.newRoad.four": "NEWRD04",
      "articleFour.medway.starHill": "STAR01",
      "articleFour.medway.stroodNorth": "STRNOR",
      "articleFour.medway.upperBush.one": "BUSH01",
      "articleFour.medway.upperBush.two": "BUSH02",
      "articleFour.medway.upperBush.three": "BUSH03",
      "articleFour.medway.upperBush.four": "BUSH04",
      "articleFour.medway.upperUpnor.one": "UPNOR01",
      "articleFour.medway.upperUpnor.two": "UPNOR02",
      "articleFour.medway.upperUpnor.three": "UPNOR03",
      "articleFour.medway.upperUpnor.four": "UPNOR04",
      "articleFour.medway.upperUpnor.five": "UPNOR05",
      "articleFour.medway.upperUpnor.six": "UPNOR06",
      "articleFour.medway.upperUpnor.seven": "UPNOR07",
      "articleFour.medway.upperUpnor.eight": "UPNOR08",
      "articleFour.medway.upperUpnor.nine": "UPNOR09",
      "articleFour.medway.upperUpnor.ten": "UPNOR10",
      "articleFour.medway.upperUpnor.eleven": "UPNOR11",
      "articleFour.medway.wattsAvenue": "WATTS01",
      "articleFour.medway.watling": "WATLIN",
      "articleFour.medway.fortPitt": "FORPIT",
    },
  },
};

export { planningConstraints };
