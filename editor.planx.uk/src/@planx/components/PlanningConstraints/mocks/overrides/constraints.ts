import { GISResponse } from "@opensystemslab/planx-core/types";
import { DEFAULT_FN } from "../../model";

// Based on Lambeth address UNIT SB, 139A, 100, BLACK PRINCE ROAD, LONDON, SE1 7SJ (July 2024)
export const mockConstraints: GISResponse["constraints"] = {
  "listed": {
    "fn": "listed",
    "value": true,
    "text": "is, or is within, a Listed Building",
    "data": [
      {
        "entry-date": "2023-05-25",
        "start-date": "1974-02-11",
        "end-date": "",
        "entity": 31657504,
        "name": "SOUTHBANK HOUSE",
        "dataset": "listed-building",
        "typology": "geography",
        "reference": "1200776",
        "prefix": "listed-building",
        "organisation-entity": "16",
        "documentation-url": "https://historicengland.org.uk/listing/the-list/list-entry/1200776",
        "listed-building-grade": "II"
      },
      {
        "entry-date": "2024-04-16",
        "start-date": "1981-03-27",
        "end-date": "",
        "entity": 42101437,
        "name": "Southbank House, Black Prince Road",
        "dataset": "listed-building-outline",
        "typology": "geography",
        "reference": "4/38",
        "prefix": "listed-building-outline",
        "organisation-entity": "192",
        "listed-building-grade": "II"
      }
    ],
    "category": "Heritage and conservation"
  },
  "designated.conservationArea": {
    "fn": "designated.conservationArea",
    "value": true,
    "text": "is in a Conservation Area",
    "data": [
      {
        "entry-date": "2024-01-13",
        "start-date": "2001-11-26",
        "end-date": "",
        "entity": 44006848,
        "name": "Albert Embankment",
        "dataset": "conservation-area",
        "typology": "geography",
        "reference": "CA57",
        "prefix": "conservation-area",
        "organisation-entity": "192"
      }
    ],
    "category": "Heritage and conservation"
  },
  "flood": {
    "fn": "flood",
    "value": true,
    "text": "is in a Flood Risk Zone",
    "data": [
      {
        "entry-date": "2023-08-24",
        "start-date": "",
        "end-date": "",
        "entity": 65106806,
        "name": "",
        "dataset": "flood-risk-zone",
        "typology": "geography",
        "reference": "106807",
        "prefix": "flood-risk-zone",
        "organisation-entity": "600009",
        "flood-risk-type": "Tidal Models",
        "flood-risk-level": "3"
      },
      {
        "entry-date": "2023-08-24",
        "start-date": "",
        "end-date": "",
        "entity": 65232137,
        "name": "",
        "dataset": "flood-risk-zone",
        "typology": "geography",
        "reference": "232138",
        "prefix": "flood-risk-zone",
        "organisation-entity": "600009",
        "flood-risk-type": "Tidal Models",
        "flood-risk-level": "2"
      }
    ],
    "category": "Flooding"
  },
  "article4": {
    "fn": "article4",
    "value": true,
    "text": "is in an Article 4 direction area",
    "data": [
      {
        "entry-date": "2021-10-29",
        "start-date": "",
        "end-date": "",
        "entity": 7010000063,
        "name": "South Bank House and Newport Street",
        "dataset": "article-4-direction-area",
        "typology": "geography",
        "reference": "13",
        "prefix": "article-4-direction-area",
        "organisation-entity": "192",
        "notes": "KIBA"
      },
      {
        "entry-date": "2024-07-11",
        "start-date": "2022-10-28",
        "end-date": "",
        "entity": 7010003268,
        "name": "Modified Direction 1 - CAZ",
        "dataset": "article-4-direction-area",
        "typology": "geography",
        "reference": "A4D10A6",
        "prefix": "article-4-direction-area",
        "organisation-entity": "192",
        "article-4-direction": "A4D10"
      },
      {
        "entry-date": "2024-07-11",
        "start-date": "2022-10-28",
        "end-date": "",
        "entity": 7010003339,
        "name": "Modified Direction 2 - KIBAs and WNCBC",
        "dataset": "article-4-direction-area",
        "typology": "geography",
        "reference": "A4D11A8",
        "prefix": "article-4-direction-area",
        "organisation-entity": "192",
        "article-4-direction": "A4D11"
      }
    ],
    "category": "General policy"
  },
  "brownfieldSite": {
    "fn": "brownfieldSite",
    "value": false,
    "text": "is not on Brownfield land",
    "category": "General policy"
  },
  "designated.AONB": {
    "fn": "designated.AONB",
    "value": false,
    "text": "is not in an Area of Outstanding Natural Beauty",
    "category": "Heritage and conservation"
  },
  "greenBelt": {
    "fn": "greenBelt",
    "value": false,
    "text": "is not in a Green Belt",
    "category": "General policy"
  },
  "designated.nationalPark": {
    "fn": "designated.nationalPark",
    "value": false,
    "text": "is not in a National Park",
    "category": "Heritage and conservation"
  },
  "designated.nationalPark.broads": {
    "fn": "designated.nationalPark.broads",
    "value": false
  },
  "designated.WHS": {
    "fn": "designated.WHS",
    "value": false,
    "text": "is not an UNESCO World Heritage Site",
    "category": "Heritage and conservation"
  },
  "monument": {
    "fn": "monument",
    "value": false,
    "text": "is not the site of a Scheduled Monument",
    "category": "Heritage and conservation"
  },
  "nature.ASNW": {
    "fn": "nature.ASNW",
    "value": false,
    "text": "is not in an Ancient Semi-Natural Woodland (ASNW)",
    "category": "Ecology"
  },
  "nature.ramsarSite": {
    "fn": "nature.ramsarSite",
    "value": false,
    "text": "is not in a Ramsar Site",
    "category": "Ecology"
  },
  "nature.SAC": {
    "fn": "nature.SAC",
    "value": false,
    "text": "is not in a Special Area of Conservation (SAC)",
    "category": "Ecology"
  },
  "nature.SPA": {
    "fn": "nature.SPA",
    "value": false,
    "text": "is not in a Special Protection Area (SPA)",
    "category": "Ecology"
  },
  "nature.SSSI": {
    "fn": "nature.SSSI",
    "value": false,
    "text": "is not a Site of Special Scientific Interest (SSSI)",
    "category": "Ecology"
  },
  "registeredPark": {
    "fn": "registeredPark",
    "value": false,
    "text": "is not in a Historic Park or Garden",
    "category": "Heritage and conservation"
  },
  "tpo": {
    "fn": "tpo",
    "value": false,
    "text": "is not in a Tree Preservation Order (TPO) Zone",
    "category": "Trees"
  },
  "designated": {
    "fn": "designated",
    "value": true
  },
  "flood.zone.2": {
    "fn": "flood.zone.2",
    "value": true
  },
  "flood.zone.3": {
    "fn": "flood.zone.3",
    "value": true
  },
  "listed.grade.I": {
    "fn": "listed.grade.I",
    "value": false
  },
  "listed.grade.II": {
    "fn": "listed.grade.II",
    "value": true
  },
  "listed.grade.II*": {
    "fn": "listed.grade.II*",
    "value": false
  },
  "article4.lambeth.streathamLodge": {
    "fn": "article4.lambeth.streathamLodge",
    "value": false
  },
  "article4.lambeth.stockwell": {
    "fn": "article4.lambeth.stockwell",
    "value": false
  },
  "article4.lambeth.leigham": {
    "fn": "article4.lambeth.leigham",
    "value": false
  },
  "article4.lambeth.stMarks": {
    "fn": "article4.lambeth.stMarks",
    "value": false
  },
  "article4.lambeth.hanover": {
    "fn": "article4.lambeth.hanover",
    "value": false
  },
  "article4.lambeth.parkHall": {
    "fn": "article4.lambeth.parkHall",
    "value": false
  },
  "article4.lambeth.lansdowne": {
    "fn": "article4.lambeth.lansdowne",
    "value": false
  },
  "article4.lambeth.albert": {
    "fn": "article4.lambeth.albert",
    "value": false
  },
  "article4.lambeth.hydeFarm": {
    "fn": "article4.lambeth.hydeFarm",
    "value": false
  },
  "article4.lambeth.kiba": {
    "fn": "article4.lambeth.kiba",
    "value": true
  },
  "article4.lambeth.kiba.clapham": {
    "fn": "article4.lambeth.kiba.clapham",
    "value": false
  },
  "article4.lambeth.kiba.brixton": {
    "fn": "article4.lambeth.kiba.brixton",
    "value": false
  },
  "article4.lambeth.caz": {
    "fn": "article4.caz",
    "value": true,
    "text": "is in the Central Activities Zone",
    "data": [
      {
        "entry-date": "2021-10-29",
        "start-date": "2018-06-04",
        "end-date": "",
        "entity": 2200001,
        "name": "",
        "dataset": "central-activities-zone",
        "typology": "geography",
        "reference": "CAZ00000001",
        "prefix": "central-activities-zone",
        "organisation-entity": "192",
        "notes": "Central London Area - part of the Borough that lies within the historic central core of London and is dominated by activities of London-wide, national and international significance. UDP policies aim"
      }
    ],
    "category": "General policy"
  },
  "road.classified": {
    "fn": "road.classified",
    "value": true,
    "text": "is on a Classified Road",
    "data": [
      {
        "name": "Black Prince Road - Classified Unnumbered",
        "entity": "Highways_RoadLink.83155",
        "properties": {
          "GmlID": "Highways_RoadLink.83155",
          "OBJECTID": 83155,
          "ID": "osgb4000000031199728",
          "Identifier": "http://data.os.uk/id/4000000031199728",
          "InspireIDNamespace": "http://data.os.uk/",
          "InspireIDLocalID": "4000000031199728",
          "Fictitious": "false",
          "RoadClassification": "Classified Unnumbered",
          "RouteHierarchy": "Local Road",
          "FormOfWay": "Single Carriageway",
          "TrunkRoad": "false",
          "PrimaryRoute": "false",
          "RoadClassificationNumber": "null",
          "RoadName1": "Black Prince Road",
          "RoadName1Lang": "null",
          "RoadName2": "null",
          "RoadName2Lang": "null",
          "AlternateName1": "null",
          "AlternateName1Lang": "null",
          "AlternateName2": "null",
          "AlternateName2Lang": "null",
          "OperationalState": "Open",
          "Provenance": "OS Urban And OS Height",
          "Directionality": "bothDirections",
          "Length": "9.61",
          "LengthUOM": "m",
          "MatchStatus": "Matched",
          "AlternateIdentifier": "5660_5304890178729",
          "StartGradeSeparation": 0,
          "EndGradeSeparation": 0,
          "RoadStructure": "null",
          "CycleFacility": "null",
          "CycleFacilityWholeLink": "null",
          "RoadWidthConfidenceLevel": "OS Urban And Full Extent",
          "RoadWidthAverage": "8.6",
          "RoadWidthMinimum": "6.9",
          "NumberOfLanes1": null,
          "NumberOfLanes1Direction": "null",
          "NumberOfLanes1MinMax": "null",
          "NumberOfLanes2": null,
          "NumberOfLanes2Direction": "null",
          "NumberOfLanes2MinMax": "null",
          "NumberOfLanes3": null,
          "NumberOfLanes3Direction": "null",
          "NumberOfLanes3MinMax": "null",
          "NumberOfLanes4": null,
          "NumberOfLanes4Direction": "null",
          "NumberOfLanes4MinMax": "null",
          "ElevationGainInDir": "0.7",
          "ElevationGainInOppDir": "0",
          "FormsPartOf": "Road#osgb4000000030488641,Street#usrn21900191,Street#usrn21998823",
          "StartNode": "osgb4000000031199141",
          "EndNode": "osgb4000000029967546",
          "RelatedRoadArea": "osgb1000001769453110",
          "BeginLifespanVersion": "6/19/2018",
          "ValidFrom": "null",
          "ReasonForChange": "Modified Attributes",
          "AlternateIdentifierScheme": "NSG Elementary Street Unit ID (ESU ID)",
          "SHAPE_Length": 9.61617839
        }
      }
    ],
    "category": "General policy"
  }
};

export const defaultIntersectingConstraints = {
  [DEFAULT_FN]: [
    "article4",
    "article4.lambeth.caz",
    "article4.lambeth.kiba",
    "designated",
    "designated.conservationArea",
    "flood",
    "flood.zone.2",
    "flood.zone.3",
    "listed",
    "listed.grade.II",
    "road.classified"
  ],
};

export const defaultNots = {
  [DEFAULT_FN]: [
    "article4.lambeth.albert",
    "article4.lambeth.hanover",
    "article4.lambeth.hydeFarm",
    "article4.lambeth.kiba.brixton",
    "article4.lambeth.kiba.clapham",
    "article4.lambeth.lansdowne",
    "article4.lambeth.leigham",
    "article4.lambeth.parkHall",
    "article4.lambeth.stMarks",
    "article4.lambeth.stockwell",
    "article4.lambeth.streathamLodge",
    "brownfieldSite",
    "designated.AONB",
    "designated.nationalPark.broads",
    "designated.nationalPark",
    "designated.WHS",
    "greenBelt",
    "listed.grade.I",
    "listed.grade.II*",
    "monument",
    "nature.ASNW",
    "nature.ramsarSite",
    "nature.SAC",
    "nature.SPA",
    "nature.SSSI",
    "registeredPark",
    "tpo",
  ],
};