/*
LAD20CD: E06000035
LAD20NM: Medway
LAD20NMW:
FID: 

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE06000035&entries=all&entry_date_day=&entry_date_month=&entry_date_year=
https://trello.com/c/cpNv0iyO/42-input-your-article-4-direction-information-into-this-spreadsheet
*/

import { LocalAuthorityMetadata } from "../../digitalLand";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  article4: {
    // Planx granular values link to Medways's source data in the following ways:
    //   * exact match of Digital Land's entity.reference
    records: {
      "article4.medway.bromptonLines": "Brompton Lines",
      "article4.medway.elmhavenMarina":
        "LAND BETWEEN ELMHAVEN MARINA AND CEMEX",
      "article4.medway.gillinghamPark": "Gillingham Park",
      "article4.medway.historicRochester.1": "Historic Rochester(1)",
      "article4.medway.historicRochester.2": "Historic Rochester(2)",
      "article4.medway.historicRochester.3": "Historic Rochester(3)",
      "article4.medway.historicRochester.4": "Historic Rochester(4)",
      "article4.medway.historicRochester.5": "Historic Rochester(5)",
      "article4.medway.historicRochester.6": "Historic Rochester(6)",
      "article4.medway.historicRochester.7": "Historic Rochester(7)",
      "article4.medway.historicRochester.8": "Historic Rochester(8)",
      "article4.medway.historicRochester.9": "Historic Rochester(9)",
      "article4.medway.historicRochester.10": "Historic Rochester(10)",
      "article4.medway.historicRochester.11": "Historic Rochester(11)",
      "article4.medway.historicRochester.12": "Historic Rochester(12)",
      "article4.medway.historicRochester.13": "Historic Rochester(13)",
      "article4.medway.historicRochester.14": "Historic Rochester(14)",
      "article4.medway.maidstoneRoad": "Maidstone Road, Chatham",
      "article4.medway.newRoad.1": "New Road Chatham(1)",
      "article4.medway.newRoad.2": "New Road Chatham(2)",
      "article4.medway.newRoad.3": "New Road Chatham(3)",
      "article4.medway.newRoad.4": "New Road Chatham(4)",
      "article4.medway.starHill": "Star Hill to Sun Pier",
      "article4.medway.upperBush.1": "Upper Bush (1)",
      "article4.medway.upperBush.2": "Upper Bush (2)",
      "article4.medway.upperBush.3": "Upper Bush(3)",
      "article4.medway.upperBush.4": "Upper Bush(4)",
      "article4.medway.upperUpnor.1": "Upper Upnor(1)",
      "article4.medway.upperUpnor.2": "Upper Upnor(2)",
      "article4.medway.upperUpnor.3": "Upper Upnor(3)",
      "article4.medway.upperUpnor.4": "Upper Upnor(4)",
      "article4.medway.upperUpnor.5": "Upper Upnor(5)",
      "article4.medway.upperUpnor.6": "Upper Upnor(6)",
      "article4.medway.upperUpnor.7": "Upper Upnor(7)",
      "article4.medway.upperUpnor.8": "Upper Upnor(8)",
      "article4.medway.upperUpnor.9": "Upper Upnor(9)",
      "article4.medway.upperUpnor.10": "Upper Upnor(10)",
      "article4.medway.upperUpnor.11": "Upper Upnor(11)",
      "article4.medway.wattsAvenue": "Watts Avenue",
    },
  },
};

export { planningConstraints };
