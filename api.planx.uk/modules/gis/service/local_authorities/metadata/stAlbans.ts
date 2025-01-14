/*
LAD20CD: E07000240
LAD20NM: St Albans
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction-area&geometry_curie=statistical-geography%3AE07000240&entry_date_day=&entry_date_month=&entry_date_year=
https://docs.google.com/spreadsheets/d/17qaNhd7M-F90KZ34kVjyetTxfxECf1QUU8UI-aUiknU/edit#gid=0
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to entity.reference on Planning Data
    records: {
      "articleFour.stAlbans.beesonend": "Ar4.8",
      "articleFour.stAlbans.beesonendChildwickbury": "Ar4.8",
      "articleFour.stAlbans.bylandsMeadow": "Ar4.15",
      "articleFour.stAlbans.childwickburyStudBlue": "Ar4.7d",
      "articleFour.stAlbans.childwickburyStudGreen": "Ar4.7c",
      "articleFour.stAlbans.childwickburyStudOrange": "Ar4.7b",
      "articleFour.stAlbans.childwickburyStudRed": "Ar4.7a",
      "articleFour.stAlbans.childwickburyStudYellow": "Ar4.7e",
      "articleFour.stAlbans.childwickGreen": "Ar4.1",
      "articleFour.stAlbans.colneyHeath": "Ar4.9",
      "articleFour.stAlbans.cunningham": "Ar4.20",
      "articleFour.stAlbans.formerRadlettAirfield": "Ar4.5",
      "articleFour.stAlbans.harpenden1": "Ar4.18",
      "articleFour.stAlbans.harpenden2": "Ar4.17",
      "articleFour.stAlbans.kimptonBottom.one": "Ar4.12",
      "articleFour.stAlbans.kimptonBottom.two": "Ar4.13",
      "articleFour.stAlbans.landBetweenRaggedHallAndMTen": "Ar4.11",
      "articleFour.stAlbans.lowerLutonNorth": "Ar4.30",
      "articleFour.stAlbans.lowerLutonSouth": "Ar4.19",
      "articleFour.stAlbans.manorRoad": "Ar4.14",
      "articleFour.stAlbans.raggedHall": "Ar4.10",
      "articleFour.stAlbans.sandridgebury": "Ar4.16",
      "articleFour.stAlbans.sopwellAndAlbert": "Ar4.6",
      "articleFour.stAlbans.theHawthornes": "Ar4.2",
      "articleFour.stAlbans.verulamAndFishpool": "Ar4.3",
      "articleFour.stAlbans.whitecroftEstate": "Ar4.4",
    },
  },
};

export { planningConstraints };
