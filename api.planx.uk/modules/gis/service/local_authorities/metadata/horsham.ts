/*
LAD20CD: E07000227
LAD20NM: Horsham
LAD20NMW:
FID:

https://www.planning.data.gov.uk/entity/?dataset=article-4-direction&dataset=article-4-direction-area&dataset=article-4-direction-rule&geometry_curie=statistical-geography%3AE07000227&limit=10#50.881947041065075,-0.2639863702688672,12.65158657563746z
https://docs.google.com/spreadsheets/d/1NWaZvR8qqQrPp-WsWqLsdqznsg8pO7Lb/edit?gid=1097348986#gid=1097348986
*/

import type { LocalAuthorityMetadata } from "../../digitalLand.js";

const planningConstraints: LocalAuthorityMetadata["planningConstraints"] = {
  articleFour: {
    // Planx granular values link to Digital Land entity.reference
    records: {
      "articleFour.horsham.wolvensFarm": "ART4002",
      "articleFour.horsham.codmoreHill": "ART4003",
      "articleFour.horsham.truleighHill": "ART4004",
      "articleFour.horsham.mainsFarm": "ART4005",
      "articleFour.horsham.rosierWood": "ART4006",
      "articleFour.horsham.fernhaven": "ART4007",
      "articleFour.horsham.leechpondHill": "ART4010",
      "articleFour.horsham.cousinsCopse": "ART4012",
      "articleFour.horsham.kinswoodPoultryFarm": "ART4013",
      "articleFour.horsham.troutLane": "ART4014",
      "articleFour.horsham.dunstansFarm": "ART4015",
      "articleFour.horsham.chaffieldsBridge": "ART4016",
      "articleFour.horsham.gennettsFarm": "ART4017",
      "articleFour.horsham.clemsfoldRoundabout": "ART4018",
      "articleFour.horsham.smallDole": "ART4019",
      "articleFour.horsham.hampersLaneA": "ART4020",
      "articleFour.horsham.hampersLaneB": "ART4020/1",
      "articleFour.horsham.woolmers": "ART4023",
      "articleFour.horsham.southEastHorsham": "ART4024",
      "articleFour.horsham.gerrardsRough": "ART4025",
      "articleFour.horsham.newStreet": "ART4026",
      "articleFour.horsham.smithersRough": "ART4027",
      "articleFour.horsham.sedgwickPark" : "ART4030",
      "articleFour.horsham.southdownHouse": "ART4031",
      "articleFour.horsham.fiveOaksElectricalSubStation": "ART4032/001",
      "articleFour.horsham.amberleyConservationArea": "ART4033",
      "articleFour.horsham.slinfoldConservationArea": "ART4034",
      "articleFour.horsham.landAndBuildings": "ART4035",
      "articleFour.horsham.gravatts": "ART4036",
      "articleFour.horsham.denneRoad": "ART4037",
      "articleFour.horsham.faygate": "ART4038",
      "articleFour.horsham.northA283": "ART4039",
      "articleFour.horsham.capelRoad": "ART4040",
      "articleFour.horsham.brightonRoad": "ART4041",
      "articleFour.horsham.storrington": "ART4042",
      "articleFour.horsham.swanBridge": "ART4043",
      "articleFour.horsham.ghyllHouseFarmA": "ART4044",
      "articleFour.horsham.ghyllHouseFarmB": "ART4045",
      "articleFour.horsham.marlandsHouse": "ART4046",
      "articleFour.horsham.arunGreenA": "ART4047",
      "articleFour.horsham.arunGreenB": "ART4053",
      "articleFour.horsham.littleGarns": "ART4054",
      "articleFour.horsham.dukesHill": "ART4055",
      "articleFour.horsham.doomsdayCottage": "ART4056",
    },
  },
};

export { planningConstraints };
