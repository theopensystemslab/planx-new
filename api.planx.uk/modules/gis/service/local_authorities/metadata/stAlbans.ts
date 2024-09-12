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
  article4: {
    // Planx granular values link to entity.reference on Planning Data
    records: {
      "article4.stAlbans.beesonend": "Ar4.8",
      "article4.stAlbans.beesonendChildwickbury": "Ar4.8",
      "article4.stAlbans.bylandsMeadow": "Ar4.15",
      "article4.stAlbans.childwickburyStudBlue": "Ar4.7d",
      "article4.stAlbans.childwickburyStudGreen": "Ar4.7c",
      "article4.stAlbans.childwickburyStudOrange": "Ar4.7b",
      "article4.stAlbans.childwickburyStudRed": "Ar4.7a",
      "article4.stAlbans.childwickburyStudYellow": "Ar4.7e",
      "article4.stAlbans.childwickGreen": "Ar4.1",
      "article4.stAlbans.colneyHeath": "Ar4.9",
      "article4.stAlbans.cunningham": "Ar4.20",
      "article4.stAlbans.formerRadlettAirfield": "Ar4.5",
      "article4.stAlbans.harpenden1": "Ar4.18",
      "article4.stAlbans.harpenden2": "Ar4.17",
      "article4.stAlbans.kimptonBottom.1": "Ar4.12",
      "article4.stAlbans.kimptonBottom.2": "Ar4.13",
      "article4.stAlbans.landBetweenRaggedHallAndM10": "Ar4.11",
      "article4.stAlbans.lowerLutonNorth": "Ar4.30",
      "article4.stAlbans.lowerLutonSouth": "Ar4.19",
      "article4.stAlbans.manorRoad": "Ar4.14",
      "article4.stAlbans.raggedHall": "Ar4.10",
      "article4.stAlbans.sandridgebury": "Ar4.16",
      "article4.stAlbans.sopwellAndAlbert": "Ar4.6",
      "article4.stAlbans.theHawthornes": "Ar4.2",
      "article4.stAlbans.verulamAndFishpool": "Ar4.3",
      "article4.stAlbans.whitecroftEstate": "Ar4.4",
    },
  },
};

export { planningConstraints };
