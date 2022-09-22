export default {
  url: "https://www.digital-land.info/entity.json?entries=current&geometry=POLYGON+%28%28-0.07629872764739991+51.485963927550074%2C+-0.07631347979698182+51.48590797485923%2C+-0.07591651286277772+51.48587707558258%2C+-0.07589907850418091+51.485932193196504%2C+-0.07629872764739991+51.485963927550074%29%29&geometry_relation=intersects&limit=100&dataset=article-4-direction&dataset=listed-building&dataset=listed-building-outline&dataset=locally-listed-building&dataset=conservation-area&dataset=area-of-outstanding-natural-beauty&dataset=national-park&dataset=world-heritage-site&dataset=scheduled-monument&dataset=tree-preservation-order&dataset=tree-preservation-zone&dataset=site-of-special-scientific-interest",
  constraints: {
    "designated.conservationArea": {
      value: true,
      text: "is in a Conservation Area",
      data: [
        {
          "entry-date": "1987-09-22",
          "start-date": "1980-02-05",
          "end-date": "",
          entity: 3017672,
          name: "Cobourg Road",
          dataset: "conservation-area",
          typology: "geography",
          reference: "7130",
          prefix: "conservation-area",
          "organisation-entity": "16",
          json: "",
        },
        {
          "entry-date": "2021-12-01",
          "start-date": "1980-02-05",
          "end-date": "",
          entity: 3022901,
          name: "Cobourg Road",
          dataset: "conservation-area",
          typology: "geography",
          reference: "19",
          prefix: "conservation-area",
          "organisation-entity": "329",
          json: {
            "documentation-url":
              "http://www.southwark.gov.uk/planning-and-building-control/design-and-conservation/conservation-areas?chapter=10",
          },
        },
        {
          "entry-date": "2020-09-04",
          "start-date": "",
          "end-date": "",
          entity: 3032152,
          name: "",
          dataset: "conservation-area",
          typology: "geography",
          reference: "COA00000164",
          prefix: "conservation-area",
          "organisation-entity": "329",
          json: "",
        },
      ],
    },
    tpo: {
      value: true,
      text: "is in a Tree Preservation Order (TPO) Zone",
      data: [
        {
          "entry-date": "2021-12-02",
          "start-date": "1993-01-13",
          "end-date": "",
          entity: 19100053,
          name: "School Nature Area, Cobourg Road",
          dataset: "tree-preservation-zone",
          typology: "geography",
          reference: "228",
          prefix: "tree-preservation-zone",
          "organisation-entity": "329",
          json: {
            "tree-species-list": "Mixed Woodland",
            "tree-preservation-type": "Woodland",
            "tree-preservation-zone": "228",
            "tree-preservation-order": "228",
          },
        },
      ],
    },
    listed: {
      value: true,
      text: "is, or is within, a Listed Building",
      data: [
        {
          "entry-date": "2022-03-11",
          "start-date": "1986-01-24",
          "end-date": "",
          entity: 31834148,
          name: "47, COBOURG ROAD",
          dataset: "listed-building",
          typology: "geography",
          reference: "1378486",
          prefix: "listed-building",
          "organisation-entity": "16",
          json: {
            "documentation-url":
              "https://historicengland.org.uk/listing/the-list/list-entry/1378486",
            "listed-building-grade": "II",
          },
        },
        {
          "entry-date": "2021-12-08",
          "start-date": "1986-01-24",
          "end-date": "",
          entity: 42102419,
          name: "",
          dataset: "listed-building-outline",
          typology: "geography",
          reference: "470787",
          prefix: "listed-building-outline",
          "organisation-entity": "329",
          json: {
            "documentation-url":
              "https://geo.southwark.gov.uk/connect/analyst/Includes/ListedBuildings/SwarkLB201.pdf",
            "listed-building-grade": "II",
          },
        },
      ],
    },
    article4: {
      value: false,
      text: "is not subject to local permitted development restrictions (known as Article 4 directions)",
    },
    "designated.AONB": {
      value: false,
      text: "is not in an Area of Outstanding Natural Beauty",
    },
    "designated.nationalPark": {
      value: false,
      text: "is not in a National Park",
    },
    "designated.WHS": {
      value: false,
      text: "is not an UNESCO World Heritage Site",
    },
    monument: {
      value: false,
      text: "is not the site of a Scheduled Monument",
    },
    "nature.SSSI": {
      value: false,
      text: "is not a Site of Special Scientific Interest (SSSI)",
    },
    designated: {
      value: true,
    },
  },
};
