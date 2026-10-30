// Watergate, Brecon (Bannau Brycheiniog), October 2026
// https://api.editor.planx.uk/gis/bannau-brycheiniog?geom=POLYGON+((-3.3936132006468496+51.947729627266995,+-3.3931940269079304+51.947912199142365,+-3.392651979707205+51.94781021071799,+-3.3928334712982187+51.94745993756598,+-3.3936132006468496+51.947729627266995))
export default {
  sourceRequest:
    "inspire-nrw:NRW_AONB, geonode:conservation_areas_wales, inspire-nrw:NRW_NATIONAL_PARK, inspire-wg:Cadw_ListedBuildings, inspire-wg:vGeoServer_WorldHeritageSites_Public, inspire-wg:Cadw_SAM, geonode:cadw_rhpg_registeredareas, inspire-nrw:NRW_ANCIENT_WOODLAND_INVENTORY_2021, inspire-nrw:NRW_SSSI, inspire-nrw:NRW_SAC, inspire-nrw:NRW_SPA, inspire-nrw:NRW_RAMSAR, inspire-wg:GWC_NRW_SensitiveHabitats, inspire-nrw:NRW_FLOODZONE_RIVERS_SEAS_MERGED",
  constraints: {
    "designated.conservationArea": {
      fn: "designated.conservationArea",
      value: true,
      text: "is in a Conservation Area",
      data: [
        {
          sitename: "Brecon",
          name: "Brecon",
          entity: "conservation_areas_wales.16",
        },
      ],
      category: "Heritage and conservation",
    },
    "designated.nationalPark": {
      fn: "designated.nationalPark",
      value: true,
      text: "is in a National Park",
      data: [
        {
          np_name: "Bannau Brycheiniog / Brecon Beacons",
          name: "Bannau Brycheiniog / Brecon Beacons",
          entity: "NRW_NATIONAL_PARK.2",
        },
      ],
      category: "Heritage and conservation",
    },
    listed: {
      fn: "listed",
      value: true,
      text: "is, or is within, a Listed Building",
      data: [
        {
          Name: "11 Ship Street",
          Grade: "II",
          name: "11 Ship Street",
          entity: "Cadw_ListedBuildings.6492",
        },
        {
          Name: "Boar's Head PH",
          Grade: "II",
          name: "Boar's Head PH",
          entity: "Cadw_ListedBuildings.6551",
        },
        {
          Name: "13 Watergate",
          Grade: "II",
          name: "13 Watergate",
          entity: "Cadw_ListedBuildings.6552",
        },
        {
          Name: "11 Watergate",
          Grade: "II",
          name: "11 Watergate",
          entity: "Cadw_ListedBuildings.28840",
        },
      ],
      category: "Heritage and conservation",
    },
    "listed.gradeOne": {
      fn: "listed.gradeOne",
      value: false,
    },
    "listed.gradeTwo": {
      fn: "listed.gradeTwo",
      value: true,
    },
    "listed.gradeTwoStar": {
      fn: "listed.gradeTwoStar",
      value: false,
    },
    monument: {
      fn: "monument",
      value: true,
      text: "is the site of a Scheduled Monument",
      data: [
        {
          Name: "Brecon Bridge",
          name: "Brecon Bridge",
          entity: "Cadw_SAM.1546",
        },
      ],
      category: "Heritage and conservation",
    },
    "nature.SSSI": {
      fn: "nature.SSSI",
      value: true,
      text: "is a Site of Special Scientific Interest (SSSI)",
      data: [
        {
          sssi_name: "River Usk (Upper Usk) / Afon Wysg (Wysg Uchaf)",
          id: 923,
          name: "River Usk (Upper Usk) / Afon Wysg (Wysg Uchaf)",
          entity: "NRW_SSSI.15039",
        },
      ],
      category: "Ecology",
    },
    "nature.SAC": {
      fn: "nature.SAC",
      value: true,
      text: "is in a Special Area of Conservation (SAC)",
      data: [
        {
          SAC_name:
            "River Usk / Afon Wysg                                                                              ",
          name: "River Usk / Afon Wysg",
          entity: "NRW_SAC.93",
        },
      ],
      category: "Ecology",
    },
    flood: {
      fn: "flood",
      value: true,
      text: "is in a Flood Risk Zone",
      data: [
        {
          risk: "Flood Zone 3",
          entity: "NRW_FLOODZONE_RIVERS_SEAS_MERGED.125498",
        },
        {
          risk: "Flood Zone 3",
          entity: "NRW_FLOODZONE_RIVERS_SEAS_MERGED.181356",
        },
        {
          risk: "Flood Zone 2",
          entity: "NRW_FLOODZONE_RIVERS_SEAS_MERGED.287572",
        },
        {
          risk: "Flood Zone 2",
          entity: "NRW_FLOODZONE_RIVERS_SEAS_MERGED.287577",
        },
        {
          risk: "Flood Zone 2",
          entity: "NRW_FLOODZONE_RIVERS_SEAS_MERGED.300521",
        },
      ],
      category: "Flooding",
    },
    "flood.zoneTwo": {
      fn: "flood.zoneTwo",
      value: true,
    },
    "flood.zoneThree": {
      fn: "flood.zoneThree",
      value: true,
    },
    "designated.AONB": {
      fn: "designated.AONB",
      value: false,
      text: "is not in an Area of Outstanding Natural Beauty",
      category: "Heritage and conservation",
    },
    "designated.WHS": {
      fn: "designated.WHS",
      value: false,
      text: "is not an UNESCO World Heritage Site",
      category: "Heritage and conservation",
    },
    registeredPark: {
      fn: "registeredPark",
      value: false,
      text: "is not in a Registered Park and Garden",
      category: "Heritage and conservation",
    },
    "nature.ASNW": {
      fn: "nature.ASNW",
      value: false,
      text: "is not in an Ancient Semi-Natural Woodland (ASNW)",
      category: "Ecology",
    },
    "nature.SPA": {
      fn: "nature.SPA",
      value: false,
      text: "is not in a Special Protection Area (SPA)",
      category: "Ecology",
    },
    "nature.ramsarSite": {
      fn: "nature.ramsarSite",
      value: false,
      text: "is not in a Ramsar site",
      category: "Ecology",
    },
    "nature.priorityHabitat": {
      fn: "nature.priorityHabitat",
      value: false,
      text: "is not in a Priority Habitat",
      category: "Ecology",
    },
    designated: {
      value: true,
    },
  },
  metadata: {
    "designated.AONB": {
      name: "Areas of Outstanding Natural Beauty (AONB)",
      plural: "Areas of Outstanding Natural Beauty (AONB)",
      dataset: "inspire-nrw:NRW_AONB",
      text: "For more information about this dataset, visit [DataMapWales](https://datamap.gov.wales/layers/inspire-nrw:NRW_AONB).",
    },
    "designated.conservationArea": {
      name: "Conservation areas",
      plural: "Conservation areas",
      dataset: "geonode:conservation_areas_wales",
      text: "For more information about this dataset, visit [DataMapWales](https://datamap.gov.wales/layers/geonode:conservation_areas_wales).",
    },
    "designated.nationalPark": {
      name: "National Parks",
      plural: "National Parks",
      dataset: "inspire-nrw:NRW_NATIONAL_PARK",
      text: "For more information about this dataset, visit [DataMapWales](https://datamap.gov.wales/layers/inspire-nrw:NRW_NATIONAL_PARK).",
    },
    listed: {
      name: "Listed buildings",
      plural: "Listed buildings",
      dataset: "inspire-wg:Cadw_ListedBuildings",
      text: "For more information about this dataset, visit [DataMapWales](https://datamap.gov.wales/layers/inspire-wg:Cadw_ListedBuildings).",
    },
    "designated.WHS": {
      name: "UNESCO World Heritage Sites (WHS)",
      plural: "UNESCO World Heritage Sites (WHS)",
      dataset: "inspire-wg:vGeoServer_WorldHeritageSites_Public",
      text: "For more information about this dataset, visit [DataMapWales](https://datamap.gov.wales/layers/inspire-wg:vGeoServer_WorldHeritageSites_Public).",
    },
    monument: {
      name: "Scheduled Monuments",
      plural: "Scheduled Monuments",
      dataset: "inspire-wg:Cadw_SAM",
      text: "For more information about this dataset, visit [DataMapWales](https://datamap.gov.wales/layers/inspire-wg:Cadw_SAM).",
    },
    registeredPark: {
      name: "Registered parks and gardens",
      plural: "Registered parks and gardens",
      dataset: "geonode:cadw_rhpg_registeredareas",
      text: "For more information about this dataset, visit [DataMapWales](https://datamap.gov.wales/layers/geonode:cadw_rhpg_registeredareas).",
    },
    "nature.ASNW": {
      name: "Ancient Semi-Natural Woodlands (ASNW)",
      plural: "Ancient Semi-Natural Woodlands (ASNW)",
      dataset: "inspire-nrw:NRW_ANCIENT_WOODLAND_INVENTORY_2021",
      text: "For more information about this dataset, visit [DataMapWales](https://datamap.gov.wales/layers/inspire-nrw:NRW_ANCIENT_WOODLAND_INVENTORY_2021).",
    },
    "nature.SSSI": {
      name: "Sites of Special Scientific Interest (SSSI)",
      plural: "Sites of Special Scientific Interest (SSSI)",
      dataset: "inspire-nrw:NRW_SSSI",
      text: "For more information about this dataset, visit [DataMapWales](https://datamap.gov.wales/layers/inspire-nrw:NRW_SSSI).",
    },
    "nature.SAC": {
      name: "Special Areas of Conservation (SAC)",
      plural: "Special Areas of Conservation (SAC)",
      dataset: "inspire-nrw:NRW_SAC",
      text: "For more information about this dataset, visit [DataMapWales](https://datamap.gov.wales/layers/inspire-nrw:NRW_SAC).",
    },
    "nature.SPA": {
      name: "Special Protection Areas (SPA)",
      plural: "Special Protection Areas (SPA)",
      dataset: "inspire-nrw:NRW_SPA",
      text: "For more information about this dataset, visit [DataMapWales](https://datamap.gov.wales/layers/inspire-nrw:NRW_SPA).",
    },
    "nature.ramsarSite": {
      name: "Ramsar sites",
      plural: "Ramsar sites",
      dataset: "inspire-nrw:NRW_RAMSAR",
      text: "For more information about this dataset, visit [DataMapWales](https://datamap.gov.wales/layers/inspire-nrw:NRW_RAMSAR).",
    },
    "nature.priorityHabitat": {
      name: "Priority habitats",
      plural: "Priority habitats",
      dataset: "inspire-wg:GWC_NRW_SensitiveHabitats",
      text: "For more information about this dataset, visit [DataMapWales](https://datamap.gov.wales/layers/inspire-wg:GWC_NRW_SensitiveHabitats).",
    },
    flood: {
      name: "Flood risk",
      plural: "Flood risk",
      dataset: "inspire-nrw:NRW_FLOODZONE_RIVERS_SEAS_MERGED",
      text: "For more information about this dataset, visit [DataMapWales](https://datamap.gov.wales/layers/inspire-nrw:NRW_FLOODZONE_RIVERS_SEAS_MERGED).",
    },
  },
};
