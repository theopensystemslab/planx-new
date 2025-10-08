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
      "articleFour.medway.bromptonLines": "Brompton Lines",
      "articleFour.medway.elmhavenMarina":
        "LAND BETWEEN ELMHAVEN MARINA AND CEMEX",
      "articleFour.medway.gillinghamPark": "Gillingham Park",
      "articleFour.medway.historicRochester.one": "Historic Rochester(1)",
      "articleFour.medway.historicRochester.two": "Historic Rochester(2)",
      "articleFour.medway.historicRochester.three": "Historic Rochester(3)",
      "articleFour.medway.historicRochester.four": "Historic Rochester(4)",
      "articleFour.medway.historicRochester.five": "Historic Rochester(5)",
      "articleFour.medway.historicRochester.six": "Historic Rochester(6)",
      "articleFour.medway.historicRochester.seven": "Historic Rochester(7)",
      "articleFour.medway.historicRochester.eight": "Historic Rochester(8)",
      "articleFour.medway.historicRochester.nine": "Historic Rochester(9)",
      "articleFour.medway.historicRochester.ten": "Historic Rochester(10)",
      "articleFour.medway.historicRochester.eleven": "Historic Rochester(11)",
      "articleFour.medway.historicRochester.twelve": "Historic Rochester(12)",
      "articleFour.medway.historicRochester.thirteen": "Historic Rochester(13)",
      "articleFour.medway.historicRochester.fourteen": "Historic Rochester(14)",
      "articleFour.medway.maidstoneRoad": "Maidstone Road, Chatham",
      "articleFour.medway.newRoad.one": "New Road Chatham(1)",
      "articleFour.medway.newRoad.two": "New Road Chatham(2)",
      "articleFour.medway.newRoad.three": "New Road Chatham(3)",
      "articleFour.medway.newRoad.four": "New Road Chatham(4)",
      "articleFour.medway.starHill": "Star Hill to Sun Pier",
      "articleFour.medway.upperBush.one": "Upper Bush (1)",
      "articleFour.medway.upperBush.two": "Upper Bush (2)",
      "articleFour.medway.upperBush.three": "Upper Bush(3)",
      "articleFour.medway.upperBush.four": "Upper Bush(4)",
      "articleFour.medway.upperUpnor.one": "Upper Upnor(1)",
      "articleFour.medway.upperUpnor.two": "Upper Upnor(2)",
      "articleFour.medway.upperUpnor.three": "Upper Upnor(3)",
      "articleFour.medway.upperUpnor.four": "Upper Upnor(4)",
      "articleFour.medway.upperUpnor.five": "Upper Upnor(5)",
      "articleFour.medway.upperUpnor.six": "Upper Upnor(6)",
      "articleFour.medway.upperUpnor.seven": "Upper Upnor(7)",
      "articleFour.medway.upperUpnor.eight": "Upper Upnor(8)",
      "articleFour.medway.upperUpnor.nine": "Upper Upnor(9)",
      "articleFour.medway.upperUpnor.ten": "Upper Upnor(10)",
      "articleFour.medway.upperUpnor.eleven": "Upper Upnor(11)",
      "articleFour.medway.wattsAvenue": "Watts Avenue",
    },
  },
};

export { planningConstraints };
