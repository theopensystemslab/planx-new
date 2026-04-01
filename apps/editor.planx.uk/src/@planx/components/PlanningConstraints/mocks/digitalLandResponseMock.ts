// LAMBETH PALACE, LAMBETH PALACE ROAD, LONDON, SE1 7JU
// https://api.editor.planx.uk/gis/lambeth?geom=MULTIPOLYGON+(((-0.116166+51.49811,+-0.117051+51.498393,+-0.11743+51.497913,+-0.118138+51.497865,+-0.118759+51.497635,+-0.118954+51.497553,+-0.119143+51.497456,+-0.119321+51.497335,+-0.119506+51.497165,+-0.119634+51.497005,+-0.120233+51.496086,+-0.120389+51.495861,+-0.120496+51.49567,+-0.120665+51.495185,+-0.120653+51.495182,+-0.12071+51.49507,+-0.120714+51.494936,+-0.120705+51.494878,+-0.120681+51.494805,+-0.12068+51.49478,+-0.120623+51.494666,+-0.120576+51.494647,+-0.120541+51.494655,+-0.120506+51.494834,+-0.12047+51.494835,+-0.120427+51.495014,+-0.120422+51.495012,+-0.120365+51.495123,+-0.119848+51.495095,+-0.119515+51.495031,+-0.119465+51.494833,+-0.11898+51.49489,+-0.11829+51.494999,+-0.118237+51.495184,+-0.117728+51.495284,+-0.11769+51.49527,+-0.117568+51.495288,+-0.117408+51.495229,+-0.117376+51.495146,+-0.117208+51.495186,+-0.117274+51.495531,+-0.117257+51.495574,+-0.117209+51.495619,+-0.117135+51.495654,+-0.116738+51.495732,+-0.11638+51.496395,+-0.116262+51.496605,+-0.116198+51.4967,+-0.115547+51.497637,+-0.115388+51.497885,+-0.115262+51.49787,+-0.115248+51.497914,+-0.115357+51.497927,+-0.115354+51.497938,+-0.115443+51.497937,+-0.115478+51.49789,+-0.116166+51.49811)))&vals=archaeologicalPriorityArea,articleFour,articleFour.caz,battlefield,brownfieldSite,designated.AONB,designated.conservationArea,greenBelt,designated.nationalPark,designated.nationalPark.broads,designated.WHS,flood,listed,monument,nature.ASNW,nature.ramsarSite,nature.SAC,nature.SPA,nature.SSSI,registeredPark,road.classified,tpo
export default {
  "sourceRequest": "https://www.planning.data.gov.uk/entity.json?entries=current&geometry=MULTIPOLYGON+%28%28%28-0.116166+51.49811%2C+-0.117051+51.498393%2C+-0.11743+51.497913%2C+-0.118138+51.497865%2C+-0.118759+51.497635%2C+-0.118954+51.497553%2C+-0.119143+51.497456%2C+-0.119321+51.497335%2C+-0.119506+51.497165%2C+-0.119634+51.497005%2C+-0.120233+51.496086%2C+-0.120389+51.495861%2C+-0.120496+51.49567%2C+-0.120665+51.495185%2C+-0.120653+51.495182%2C+-0.12071+51.49507%2C+-0.120714+51.494936%2C+-0.120705+51.494878%2C+-0.120681+51.494805%2C+-0.12068+51.49478%2C+-0.120623+51.494666%2C+-0.120576+51.494647%2C+-0.120541+51.494655%2C+-0.120506+51.494834%2C+-0.12047+51.494835%2C+-0.120427+51.495014%2C+-0.120422+51.495012%2C+-0.120365+51.495123%2C+-0.119848+51.495095%2C+-0.119515+51.495031%2C+-0.119465+51.494833%2C+-0.11898+51.49489%2C+-0.11829+51.494999%2C+-0.118237+51.495184%2C+-0.117728+51.495284%2C+-0.11769+51.49527%2C+-0.117568+51.495288%2C+-0.117408+51.495229%2C+-0.117376+51.495146%2C+-0.117208+51.495186%2C+-0.117274+51.495531%2C+-0.117257+51.495574%2C+-0.117209+51.495619%2C+-0.117135+51.495654%2C+-0.116738+51.495732%2C+-0.11638+51.496395%2C+-0.116262+51.496605%2C+-0.116198+51.4967%2C+-0.115547+51.497637%2C+-0.115388+51.497885%2C+-0.115262+51.49787%2C+-0.115248+51.497914%2C+-0.115357+51.497927%2C+-0.115354+51.497938%2C+-0.115443+51.497937%2C+-0.115478+51.49789%2C+-0.116166+51.49811%29%29%29&geometry_relation=intersects&exclude_field=geometry%2Cpoint&limit=100&dataset=archaeological-priority-area&dataset=article-4-direction-area&dataset=central-activities-zone&dataset=battlefield&dataset=brownfield-land&dataset=brownfield-site&dataset=area-of-outstanding-natural-beauty&dataset=conservation-area&dataset=green-belt&dataset=national-park&dataset=world-heritage-site&dataset=world-heritage-site-buffer-zone&dataset=flood-risk-zone&dataset=listed-building&dataset=listed-building-outline&dataset=scheduled-monument&dataset=ancient-woodland&dataset=ramsar&dataset=special-area-of-conservation&dataset=special-protection-area&dataset=site-of-special-scientific-interest&dataset=park-and-garden&dataset=tree&dataset=tree-preservation-order&dataset=tree-preservation-zone",
  "constraints": {
    "archaeologicalPriorityArea": {
      "fn": "archaeologicalPriorityArea",
      "value": true,
      "text": "is an Archaeological Priority Area",
      "data": [
        {
          "entry-date": "2025-11-21",
          "start-date": "",
          "end-date": "",
          "entity": 40267,
          "name": "Prehistoric settlement, Roman settlement and boat, medieval Riverside Zone village centres and important houses, post-medieval settlement and early industrial development.",
          "dataset": "archaeological-priority-area",
          "typology": "geography",
          "reference": "76392",
          "prefix": "archaeological-priority-area",
          "organisation-entity": "16",
          "quality": "authoritative",
          "archaeological-risk-tier": "Archaeological Priority Area"
        },
        {
          "entry-date": "2025-11-21",
          "start-date": "",
          "end-date": "",
          "entity": 40720,
          "name": "Extant medieval and post-medieval buildings. Prehistoric, roman, medieval and post-medieval archaeological discoveries.",
          "dataset": "archaeological-priority-area",
          "typology": "geography",
          "reference": "76178",
          "prefix": "archaeological-priority-area",
          "organisation-entity": "16",
          "quality": "authoritative",
          "archaeological-risk-tier": "Archaeological Priority Area"
        }
      ],
      "category": "General policy"
    },
    "registeredPark": {
      "fn": "registeredPark",
      "value": true,
      "text": "is in a Registered Park and Garden",
      "data": [
        {
          "entry-date": "2025-12-20",
          "start-date": "1987-10-01",
          "end-date": "",
          "entity": 11100711,
          "name": "LAMBETH PALACE",
          "dataset": "park-and-garden",
          "typology": "geography",
          "reference": "1000818",
          "prefix": "park-and-garden",
          "organisation-entity": "16",
          "quality": "authoritative",
          "documentation-url": "https://historicengland.org.uk/listing/the-list/list-entry/1000818",
          "park-and-garden-grade": "II"
        }
      ],
      "category": "Heritage and conservation"
    },
    "listed": {
      "fn": "listed",
      "value": true,
      "text": "is, or is within, a Listed Building",
      "data": [
        {
          "entry-date": "2026-04-01",
          "start-date": "1981-03-27",
          "end-date": "",
          "entity": 31537854,
          "name": "LAMBETH PALACE COTTAGES WALL TO EAST OF LAMBETH PALACE COURTYARD",
          "dataset": "listed-building",
          "typology": "geography",
          "reference": "1080374",
          "prefix": "listed-building",
          "organisation-entity": "16",
          "quality": "some",
          "documentation-url": "https://historicengland.org.uk/listing/the-list/list-entry/1080374",
          "listed-building-grade": "II"
        },
        {
          "entry-date": "2026-04-01",
          "start-date": "1981-03-27",
          "end-date": "",
          "entity": 31573638,
          "name": "WALL TO WEST OF THE GREAT HALL AT LAMBETH",
          "dataset": "listed-building",
          "typology": "geography",
          "reference": "1116383",
          "prefix": "listed-building",
          "organisation-entity": "16",
          "quality": "some",
          "documentation-url": "https://historicengland.org.uk/listing/the-list/list-entry/1116383",
          "listed-building-grade": "II"
        },
        {
          "entry-date": "2026-04-01",
          "start-date": "1951-10-19",
          "end-date": "",
          "entity": 31573653,
          "name": "LAMBETH PALACE",
          "dataset": "listed-building",
          "typology": "geography",
          "reference": "1116399",
          "prefix": "listed-building",
          "organisation-entity": "16",
          "quality": "some",
          "documentation-url": "https://historicengland.org.uk/listing/the-list/list-entry/1116399",
          "listed-building-grade": "I"
        },
        {
          "entry-date": "2026-04-01",
          "start-date": "1981-03-27",
          "end-date": "",
          "entity": 31814080,
          "name": "MOUNTING BLOCK TO EAST OF ENTRANCE TO LAMBETH PALACE RESIDENTIAL APARTMENTS",
          "dataset": "listed-building",
          "typology": "geography",
          "reference": "1358295",
          "prefix": "listed-building",
          "organisation-entity": "16",
          "quality": "some",
          "documentation-url": "https://historicengland.org.uk/listing/the-list/list-entry/1358295",
          "listed-building-grade": "II"
        },
        {
          "entry-date": "2026-04-01",
          "start-date": "1981-03-27",
          "end-date": "",
          "entity": 31814084,
          "name": "WALLS, RAILINGS, GATES, AND GATE PIERS TO SOUTH AND WEST OF CHURCH OF ST MARY",
          "dataset": "listed-building",
          "typology": "geography",
          "reference": "1358299",
          "prefix": "listed-building",
          "organisation-entity": "16",
          "quality": "some",
          "documentation-url": "https://historicengland.org.uk/listing/the-list/list-entry/1358299",
          "listed-building-grade": "II"
        },
        {
          "entry-date": "2026-03-05",
          "start-date": "1981-03-27",
          "end-date": "",
          "entity": 42209359,
          "name": "Listed Building Grade II",
          "dataset": "listed-building-outline",
          "typology": "geography",
          "reference": "LBL00062",
          "prefix": "listed-building-outline",
          "organisation-entity": "192",
          "quality": "authoritative",
          "listed-building": "2/602"
        },
        {
          "entry-date": "2026-03-05",
          "start-date": "1981-03-27",
          "end-date": "",
          "entity": 42209473,
          "name": "Listed Building Grade II",
          "dataset": "listed-building-outline",
          "typology": "geography",
          "reference": "LBL000178",
          "prefix": "listed-building-outline",
          "organisation-entity": "192",
          "quality": "authoritative",
          "listed-building": "2/603"
        },
        {
          "entry-date": "2026-03-05",
          "start-date": "1975-09-11",
          "end-date": "",
          "entity": 42209536,
          "name": "Listed Building Grade II",
          "dataset": "listed-building-outline",
          "typology": "geography",
          "reference": "LBL000241",
          "prefix": "listed-building-outline",
          "organisation-entity": "192",
          "quality": "authoritative",
          "listed-building": "2/604"
        },
        {
          "entry-date": "2026-03-05",
          "start-date": "1981-03-27",
          "end-date": "",
          "entity": 42209594,
          "name": "Listed Building Grade II",
          "dataset": "listed-building-outline",
          "typology": "geography",
          "reference": "LBL000299",
          "prefix": "listed-building-outline",
          "organisation-entity": "192",
          "quality": "authoritative",
          "listed-building": "2/586"
        },
        {
          "entry-date": "2026-03-05",
          "start-date": "1981-03-27",
          "end-date": "",
          "entity": 42209595,
          "name": "Listed Building Grade II",
          "dataset": "listed-building-outline",
          "typology": "geography",
          "reference": "LBL000300",
          "prefix": "listed-building-outline",
          "organisation-entity": "192",
          "quality": "authoritative",
          "listed-building": "2/590"
        },
        {
          "entry-date": "2026-03-05",
          "start-date": "1981-03-27",
          "end-date": "",
          "entity": 42209596,
          "name": "Listed Building Grade II",
          "dataset": "listed-building-outline",
          "typology": "geography",
          "reference": "LBL000301",
          "prefix": "listed-building-outline",
          "organisation-entity": "192",
          "quality": "authoritative",
          "listed-building": "2/607 and 963/4/"
        },
        {
          "entry-date": "2026-03-05",
          "start-date": "1981-03-27",
          "end-date": "",
          "entity": 42209846,
          "name": "Listed Building Grade II",
          "dataset": "listed-building-outline",
          "typology": "geography",
          "reference": "LBL000551",
          "prefix": "listed-building-outline",
          "organisation-entity": "192",
          "quality": "authoritative",
          "listed-building": "2/605"
        },
        {
          "entry-date": "2026-03-05",
          "start-date": "1981-03-27",
          "end-date": "",
          "entity": 42209850,
          "name": "Listed Building Grade II",
          "dataset": "listed-building-outline",
          "typology": "geography",
          "reference": "LBL000555",
          "prefix": "listed-building-outline",
          "organisation-entity": "192",
          "quality": "authoritative",
          "listed-building": "2/587"
        },
        {
          "entry-date": "2026-03-05",
          "start-date": "1974-10-22",
          "end-date": "",
          "entity": 42209851,
          "name": "Listed Building Grade I",
          "dataset": "listed-building-outline",
          "typology": "geography",
          "reference": "LBL000556",
          "prefix": "listed-building-outline",
          "organisation-entity": "192",
          "quality": "authoritative",
          "listed-building": "2/585"
        },
        {
          "entry-date": "2026-03-05",
          "start-date": "1975-01-09",
          "end-date": "",
          "entity": 42210001,
          "name": "Listed Building Grade II",
          "dataset": "listed-building-outline",
          "typology": "geography",
          "reference": "LBL000706",
          "prefix": "listed-building-outline",
          "organisation-entity": "192",
          "quality": "authoritative",
          "listed-building": "2/589"
        },
        {
          "entry-date": "2026-03-05",
          "start-date": "1981-03-27",
          "end-date": "",
          "entity": 42210002,
          "name": "Listed Building Grade II*",
          "dataset": "listed-building-outline",
          "typology": "geography",
          "reference": "LBL000707",
          "prefix": "listed-building-outline",
          "organisation-entity": "192",
          "quality": "authoritative",
          "listed-building": "2/606"
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
          "start-date": "1968-06-20",
          "end-date": "",
          "entity": 44006852,
          "name": "Lambeth Palace",
          "dataset": "conservation-area",
          "typology": "geography",
          "reference": "CA10",
          "prefix": "conservation-area",
          "organisation-entity": "192",
          "quality": "authoritative",
          "designation-date": "1968-06-20"
        },
        {
          "entry-date": "2020-09-04",
          "start-date": "",
          "end-date": "",
          "entity": 44008829,
          "name": "Lambeth Palace",
          "dataset": "conservation-area",
          "typology": "geography",
          "reference": "COA00000232",
          "prefix": "conservation-area",
          "organisation-entity": "192",
          "quality": "some"
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
          "entity": 65232137,
          "name": "",
          "dataset": "flood-risk-zone",
          "typology": "geography",
          "reference": "232138/2",
          "prefix": "flood-risk-zone",
          "organisation-entity": "600009",
          "quality": "authoritative",
          "flood-risk-type": "Tidal Models",
          "flood-risk-level": "2"
        },
        {
          "entry-date": "2023-08-24",
          "start-date": "",
          "end-date": "",
          "entity": 65657427,
          "name": "",
          "dataset": "flood-risk-zone",
          "typology": "geography",
          "reference": "106807/3",
          "prefix": "flood-risk-zone",
          "organisation-entity": "600009",
          "quality": "authoritative",
          "flood-risk-type": "Tidal Models",
          "flood-risk-level": "3"
        }
      ],
      "category": "Flooding"
    },
    "tpo": {
      "fn": "tpo",
      "value": true,
      "text": "is in a Tree Preservation Order (TPO) zone",
      "data": [
        {
          "entry-date": "2024-01-11",
          "start-date": "",
          "end-date": "",
          "entity": 7002008208,
          "name": "",
          "dataset": "tree",
          "typology": "geography",
          "reference": "1657",
          "prefix": "tree",
          "organisation-entity": "192",
          "quality": "authoritative",
          "address": "200000469715",
          "address-text": "Archbishops Park Lambeth Palace Road London SE1",
          "tree-species": "London Plane (Acer plantanus)",
          "tree-preservation-order": "452",
          "tree-preservation-order-tree": "10"
        },
        {
          "entry-date": "2024-01-11",
          "start-date": "",
          "end-date": "",
          "entity": 7002008209,
          "name": "",
          "dataset": "tree",
          "typology": "geography",
          "reference": "1658",
          "prefix": "tree",
          "organisation-entity": "192",
          "quality": "authoritative",
          "address": "200000469715",
          "address-text": "Archbishops Park Lambeth Palace Road London SE1",
          "tree-species": "London Plane (Acer plantanus)",
          "tree-preservation-order": "452",
          "tree-preservation-order-tree": "11"
        },
        {
          "entry-date": "2024-01-11",
          "start-date": "",
          "end-date": "",
          "entity": 7002008210,
          "name": "",
          "dataset": "tree",
          "typology": "geography",
          "reference": "1659",
          "prefix": "tree",
          "organisation-entity": "192",
          "quality": "authoritative",
          "address": "200000469715",
          "address-text": "Archbishops Park Lambeth Palace Road London SE1",
          "tree-species": "London Plane (Acer plantanus)",
          "tree-preservation-order": "452",
          "tree-preservation-order-tree": "12"
        },
        {
          "entry-date": "2024-01-11",
          "start-date": "",
          "end-date": "",
          "entity": 7002008211,
          "name": "",
          "dataset": "tree",
          "typology": "geography",
          "reference": "1660",
          "prefix": "tree",
          "organisation-entity": "192",
          "quality": "authoritative",
          "address": "200000469715",
          "address-text": "Archbishops Park Lambeth Palace Road London SE1",
          "tree-species": "London Plane (Acer plantanus)",
          "tree-preservation-order": "452",
          "tree-preservation-order-tree": "13"
        },
        {
          "entry-date": "2024-01-11",
          "start-date": "",
          "end-date": "",
          "entity": 7002008212,
          "name": "",
          "dataset": "tree",
          "typology": "geography",
          "reference": "1661",
          "prefix": "tree",
          "organisation-entity": "192",
          "quality": "authoritative",
          "address": "200000469715",
          "address-text": "Archbishops Park Lambeth Palace Road London SE1",
          "tree-species": "London Plane (Acer plantanus)",
          "tree-preservation-order": "452",
          "tree-preservation-order-tree": "14"
        },
        {
          "entry-date": "2024-01-11",
          "start-date": "",
          "end-date": "",
          "entity": 7002009093,
          "name": "",
          "dataset": "tree",
          "typology": "geography",
          "reference": "2542",
          "prefix": "tree",
          "organisation-entity": "192",
          "quality": "authoritative",
          "address": "200000469715",
          "address-text": "Archbishops Park Lambeth Palace Road London SE1",
          "tree-species": "London Plane (Acer plantanus)",
          "tree-preservation-order": "452",
          "tree-preservation-order-tree": "1"
        },
        {
          "entry-date": "2024-01-11",
          "start-date": "",
          "end-date": "",
          "entity": 7002009094,
          "name": "",
          "dataset": "tree",
          "typology": "geography",
          "reference": "2543",
          "prefix": "tree",
          "organisation-entity": "192",
          "quality": "authoritative",
          "address": "200000469715",
          "address-text": "Archbishops Park Lambeth Palace Road London SE1",
          "tree-species": "Lime (Tilia Spp)",
          "tree-preservation-order": "452",
          "tree-preservation-order-tree": "2"
        },
        {
          "entry-date": "2024-01-11",
          "start-date": "",
          "end-date": "",
          "entity": 7002009095,
          "name": "",
          "dataset": "tree",
          "typology": "geography",
          "reference": "2544",
          "prefix": "tree",
          "organisation-entity": "192",
          "quality": "authoritative",
          "address": "200000469715",
          "address-text": "Archbishops Park Lambeth Palace Road London SE1",
          "tree-species": "Lime (Tilia Spp)",
          "tree-preservation-order": "452",
          "tree-preservation-order-tree": "3"
        },
        {
          "entry-date": "2024-01-11",
          "start-date": "",
          "end-date": "",
          "entity": 7002009096,
          "name": "",
          "dataset": "tree",
          "typology": "geography",
          "reference": "2545",
          "prefix": "tree",
          "organisation-entity": "192",
          "quality": "authoritative",
          "address": "200000469715",
          "address-text": "Archbishops Park Lambeth Palace Road London SE1",
          "tree-species": "London Plane (Acer plantanus)",
          "tree-preservation-order": "452",
          "tree-preservation-order-tree": "4"
        },
        {
          "entry-date": "2024-01-11",
          "start-date": "",
          "end-date": "",
          "entity": 7002009097,
          "name": "",
          "dataset": "tree",
          "typology": "geography",
          "reference": "2546",
          "prefix": "tree",
          "organisation-entity": "192",
          "quality": "authoritative",
          "address": "200000469715",
          "address-text": "Archbishops Park Lambeth Palace Road London SE1",
          "tree-species": "London Plane (Acer plantanus)",
          "tree-preservation-order": "452",
          "tree-preservation-order-tree": "5"
        },
        {
          "entry-date": "2024-01-11",
          "start-date": "",
          "end-date": "",
          "entity": 7002009098,
          "name": "",
          "dataset": "tree",
          "typology": "geography",
          "reference": "2547",
          "prefix": "tree",
          "organisation-entity": "192",
          "quality": "authoritative",
          "address": "200000469715",
          "address-text": "Archbishops Park Lambeth Palace Road London SE1",
          "tree-species": "London Plane (Acer plantanus)",
          "tree-preservation-order": "452",
          "tree-preservation-order-tree": "6"
        },
        {
          "entry-date": "2024-01-11",
          "start-date": "",
          "end-date": "",
          "entity": 7002009099,
          "name": "",
          "dataset": "tree",
          "typology": "geography",
          "reference": "2548",
          "prefix": "tree",
          "organisation-entity": "192",
          "quality": "authoritative",
          "address": "200000469715",
          "address-text": "Archbishops Park Lambeth Palace Road London SE1",
          "tree-species": "London Plane (Acer plantanus)",
          "tree-preservation-order": "452",
          "tree-preservation-order-tree": "7"
        },
        {
          "entry-date": "2024-01-11",
          "start-date": "",
          "end-date": "",
          "entity": 7002009100,
          "name": "",
          "dataset": "tree",
          "typology": "geography",
          "reference": "2549",
          "prefix": "tree",
          "organisation-entity": "192",
          "quality": "authoritative",
          "address": "200000469715",
          "address-text": "Archbishops Park Lambeth Palace Road London SE1",
          "tree-species": "London Plane (Acer plantanus)",
          "tree-preservation-order": "452",
          "tree-preservation-order-tree": "8"
        },
        {
          "entry-date": "2024-01-11",
          "start-date": "",
          "end-date": "",
          "entity": 7002009101,
          "name": "",
          "dataset": "tree",
          "typology": "geography",
          "reference": "2550",
          "prefix": "tree",
          "organisation-entity": "192",
          "quality": "authoritative",
          "address": "200000469715",
          "address-text": "Archbishops Park Lambeth Palace Road London SE1",
          "tree-species": "London Plane (Acer plantanus)",
          "tree-preservation-order": "452",
          "tree-preservation-order-tree": "9"
        }
      ],
      "category": "Trees"
    },
    "articleFour": {
      "fn": "articleFour",
      "value": true,
      "text": "is in an Article 4 direction area",
      "data": [
        {
          "entry-date": "2024-07-11",
          "start-date": "2022-10-28",
          "end-date": "",
          "entity": 7010003299,
          "name": "Modified Direction 1 - CAZ",
          "dataset": "article-4-direction-area",
          "typology": "geography",
          "reference": "A4D10A37",
          "prefix": "article-4-direction-area",
          "organisation-entity": "192",
          "quality": "authoritative",
          "article-4-direction": "A4D10"
        },
        {
          "entry-date": "2024-07-11",
          "start-date": "2022-10-28",
          "end-date": "",
          "entity": 7010003328,
          "name": "Modified Direction 1 - CAZ",
          "dataset": "article-4-direction-area",
          "typology": "geography",
          "reference": "A4D10A66",
          "prefix": "article-4-direction-area",
          "organisation-entity": "192",
          "quality": "authoritative",
          "article-4-direction": "A4D10"
        }
      ],
      "category": "General policy"
    },
    "battlefield": {
      "fn": "battlefield",
      "value": false,
      "text": "is not on a historic battlefield",
      "category": "Heritage and conservation"
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
      "text": "is not in a Ramsar site",
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
    "road.classified": {
      "fn": "road.classified",
      "value": false,
      "text": "is not on a Classified Road",
      "category": "General policy"
    },
    "designated": {
      "fn": "designated",
      "value": true
    },
    "flood.zoneTwo": {
      "fn": "flood.zoneTwo",
      "value": true
    },
    "flood.zoneThree": {
      "fn": "flood.zoneThree",
      "value": true
    },
    "listed.gradeOne": {
      "fn": "listed.gradeOne",
      "value": true
    },
    "listed.gradeTwo": {
      "fn": "listed.gradeTwo",
      "value": true
    },
    "listed.gradeTwoStar": {
      "fn": "listed.gradeTwoStar",
      "value": false
    },
    "articleFour.lambeth.streathamLodge": {
      "fn": "articleFour.lambeth.streathamLodge",
      "value": false
    },
    "articleFour.lambeth.stockwell": {
      "fn": "articleFour.lambeth.stockwell",
      "value": false
    },
    "articleFour.lambeth.leigham": {
      "fn": "articleFour.lambeth.leigham",
      "value": false
    },
    "articleFour.lambeth.stMarks": {
      "fn": "articleFour.lambeth.stMarks",
      "value": false
    },
    "articleFour.lambeth.hanover": {
      "fn": "articleFour.lambeth.hanover",
      "value": false
    },
    "articleFour.lambeth.parkHall": {
      "fn": "articleFour.lambeth.parkHall",
      "value": false
    },
    "articleFour.lambeth.lansdowne": {
      "fn": "articleFour.lambeth.lansdowne",
      "value": false
    },
    "articleFour.lambeth.albert": {
      "fn": "articleFour.lambeth.albert",
      "value": false
    },
    "articleFour.lambeth.hydeFarm": {
      "fn": "articleFour.lambeth.hydeFarm",
      "value": false
    },
    "articleFour.lambeth.kiba": {
      "fn": "articleFour.lambeth.kiba",
      "value": false
    },
    "articleFour.lambeth.kiba.clapham": {
      "fn": "articleFour.lambeth.kiba.clapham",
      "value": false
    },
    "articleFour.lambeth.kiba.brixton": {
      "fn": "articleFour.lambeth.kiba.brixton",
      "value": false
    },
    "articleFour.lambeth.caz": {
      "fn": "articleFour.caz",
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
          "organisation-entity": "",
          "quality": "some",
          "notes": "Central London Area - part of the Borough that lies within the historic central core of London and is dominated by activities of London-wide, national and international significance. UDP policies aim"
        }
      ],
      "category": "General policy"
    }
  },
  "metadata": {
    "archaeologicalPriorityArea": {
      "entry-date": "2025-02-04",
      "start-date": "",
      "end-date": "",
      "collection": "archaeological-priority-area",
      "dataset": "archaeological-priority-area",
      "description": "Areas of Greater London where there is significant known archaeological interest or potential for new discoveries",
      "name": "Archaeological priority area",
      "plural": "Archaeological priority areas",
      "prefix": "",
      "text": "The Greater London Archaeological Priority Areas (APAs) are areas in London that have significant archaeological interest or potential for new discoveries\n\nThe APAs are based on evidence in the Greater London Historic Environment Record (GLHER)\nThey were created in the 1970s and 1980s by boroughs and local museums\nThey are being updated using new evidence and standards\nThe new system assigns all land to one of four tiers based on archaeological risk",
      "typology": "geography",
      "wikidata": "",
      "wikipedia": "",
      "entities": "",
      "themes": [
        "environment",
        "heritage"
      ],
      "entity-count": {
        "dataset": "archaeological-priority-area",
        "count": 796
      },
      "paint-options": {
        "colour": "#b54405",
        "opacity": 0.35
      },
      "attribution": "historic-england",
      "attribution-text": "© Historic England 2026. Contains Ordnance Survey data © Crown copyright and database right 2026.\nThe Historic England GIS Data contained in this material was obtained on [date].\nThe most publicly available up to date Historic England GIS Data can be obtained from [HistoricEngland.org.uk](https://historicengland.org.uk).",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "greater-london-archaeological-priority-areas",
      "github-discussion": 89,
      "entity-minimum": 40000,
      "entity-maximum": 59999,
      "phase": "live",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "articleFour": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "article-4-direction",
      "dataset": "article-4-direction-area",
      "description": "Orders made by the local planning authority to remove all or some of the permitted development rights on a site in order to protect it",
      "name": "Article 4 direction area",
      "plural": "Article 4 direction areas",
      "prefix": "",
      "text": "This dataset contains information on areas affected by article 4 directions.\n\nIt can be used for controlling development by requiring a planning application for work that would otherwise be classed as permitted development.",
      "typology": "geography",
      "wikidata": "",
      "wikipedia": "",
      "entities": "",
      "themes": [
        "heritage"
      ],
      "entity-count": {
        "dataset": "article-4-direction-area",
        "count": 6795
      },
      "paint-options": "",
      "attribution": "crown-copyright",
      "attribution-text": "© Crown copyright and database right 2026",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "article-4-directions",
      "github-discussion": 30,
      "entity-minimum": 7010000000,
      "entity-maximum": 7019999999,
      "phase": "beta",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "articleFour.caz": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "central-activities-zone",
      "dataset": "central-activities-zone",
      "description": "",
      "name": "Central activities zone",
      "plural": "Central activities zones",
      "prefix": "",
      "text": "The [Greater London Authority](https://www.london.gov.uk/) (GLA) designates a central area of London with [implications for planning](https://www.london.gov.uk/what-we-do/planning/implementing-london-plan/london-plan-guidance-and-spgs/central-activities-zone)\nThis dataset combines data provided by the GLA with the boundary from the individual London boroughs.",
      "typology": "geography",
      "wikidata": "",
      "wikipedia": "",
      "entities": "",
      "themes": [
        "development"
      ],
      "entity-count": {
        "dataset": "central-activities-zone",
        "count": 10
      },
      "paint-options": "",
      "attribution": "crown-copyright",
      "attribution-text": "© Crown copyright and database right 2026",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "central-activty-zones",
      "github-discussion": "",
      "entity-minimum": 2200000,
      "entity-maximum": 2299999,
      "phase": "beta",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "battlefield": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "historic-england",
      "dataset": "battlefield",
      "description": "",
      "name": "Battlefield",
      "plural": "Battlefields",
      "prefix": "",
      "text": "Battlefields as designated by [Historic England](https://historicengland.org.uk) in their [Register of Historic Battlefields](https://historicengland.org.uk/listing/what-is-designation/registered-battlefields/).",
      "typology": "geography",
      "wikidata": "Q4895508",
      "wikipedia": "Battlefield",
      "entities": "",
      "themes": [
        "heritage"
      ],
      "entity-count": {
        "dataset": "battlefield",
        "count": 94
      },
      "paint-options": {
        "colour": "#4d2942",
        "opacity": 0.2
      },
      "attribution": "historic-england",
      "attribution-text": "© Historic England 2026. Contains Ordnance Survey data © Crown copyright and database right 2026.\nThe Historic England GIS Data contained in this material was obtained on [date].\nThe most publicly available up to date Historic England GIS Data can be obtained from [HistoricEngland.org.uk](https://historicengland.org.uk).",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "battlefields",
      "github-discussion": "",
      "entity-minimum": 1400000,
      "entity-maximum": 1499999,
      "phase": "live",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "brownfieldSite": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "brownfield-site",
      "dataset": "brownfield-site",
      "description": "",
      "name": "Brownfield site",
      "plural": "Brownfield sites",
      "prefix": "",
      "text": "This is an experimental dataset of the boundaries of brownfield sites found on [data.gov.uk](https://www.data.gov.uk/search?q=brownfield)\nand local planning authority web sites.\nWe expect to combine this dataset with the [brownfield land](/dataset/brownfield-land) dataset in the near future.",
      "typology": "geography",
      "wikidata": "Q896586",
      "wikipedia": "Brownfield_land",
      "entities": "",
      "themes": [
        "development"
      ],
      "entity-count": {
        "dataset": "brownfield-site",
        "count": 2874
      },
      "paint-options": {
        "colour": "#745729"
      },
      "attribution": "crown-copyright",
      "attribution-text": "© Crown copyright and database right 2026",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "brownfield-land",
      "github-discussion": 28,
      "entity-minimum": 1800000,
      "entity-maximum": 1899999,
      "phase": "alpha",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "designated.AONB": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "area-of-outstanding-natural-beauty",
      "dataset": "area-of-outstanding-natural-beauty",
      "description": "Land protected by law to conserve and enhance its natural beauty",
      "name": "Area of outstanding natural beauty",
      "plural": "Areas of outstanding natural beauty",
      "prefix": "",
      "text": "An area of outstanding natural beauty (AONB) as designated by [Natural England](https://www.gov.uk/government/organisations/natural-england).\n\nNatural England provides [guidance](https://www.gov.uk/guidance/protected-sites-and-areas-how-to-review-planning-applications) to help local authorities decide on planning applications in protected sites and areas.",
      "typology": "geography",
      "wikidata": "Q174945",
      "wikipedia": "Area_of_Outstanding_Natural_Beauty",
      "entities": "",
      "themes": [
        "environment"
      ],
      "entity-count": {
        "dataset": "area-of-outstanding-natural-beauty",
        "count": 34
      },
      "paint-options": {
        "colour": "#d53880"
      },
      "attribution": "natural-england",
      "attribution-text": "© Natural England copyright. Contains Ordnance Survey data © Crown copyright and database right 2026.",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "areas-of-outstanding-natural-beauty",
      "github-discussion": 31,
      "entity-minimum": 1000000,
      "entity-maximum": 1099999,
      "phase": "live",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "designated.conservationArea": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "conservation-area",
      "dataset": "conservation-area",
      "description": "areas of special architectural or historic interest, the character or appearance of which it is desirable to preserve or enhance",
      "name": "Conservation area",
      "plural": "Conservation areas",
      "prefix": "",
      "text": "Conservation areas are defined by the [Planning (Listed Buildings and Conservation Areas) Act 1990](https://www.legislation.gov.uk/ukpga/1990/9#section-69) as areas of special architectural or historic interest, the character or appearance of which it is desirable to preserve or enhance.\n\nThey are a consideration for a number of different planning decisions related to [conserving and enhancing the historic environment](https://www.gov.uk/guidance/conserving-and-enhancing-the-historic-environment).\n\nThe dataset contains some authoritative data provided by local planning authorities, \nas well as data collected from from Historic England and other sources found on\n[data.gov.uk](https://www.data.gov.uk/search?q=conservation+area). \nIt should be treated as a work in progress, and is currently incomplete.\nIt also contains a number of duplicate conservation areas we are working to reconcile.",
      "typology": "geography",
      "wikidata": "Q5162904",
      "wikipedia": "Conservation_area_(United_Kingdom)",
      "entities": "",
      "themes": [
        "heritage"
      ],
      "entity-count": {
        "dataset": "conservation-area",
        "count": 10907
      },
      "paint-options": {
        "colour": "#78AA00"
      },
      "attribution": "historic-england",
      "attribution-text": "© Historic England 2026. Contains Ordnance Survey data © Crown copyright and database right 2026.\nThe Historic England GIS Data contained in this material was obtained on [date].\nThe most publicly available up to date Historic England GIS Data can be obtained from [HistoricEngland.org.uk](https://historicengland.org.uk).",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "conservation-areas",
      "github-discussion": 33,
      "entity-minimum": 44000000,
      "entity-maximum": 44999999,
      "phase": "beta",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "greenBelt": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "green-belt",
      "dataset": "green-belt",
      "description": "",
      "name": "Green belt",
      "plural": "Green belt",
      "prefix": "",
      "text": "This dataset contains boundaries for land designated by a local planning authority as being [green belt](https://www.gov.uk/guidance/green-belt),\ngrouped using the [greenbelt core](/dataset/greenbelt-core) category.\n\nIt can be used for planning purposes, such as preparing local plans to define areas that are kept permanently open and free from urban sprawl.\n\nLocal planning authorities provide annual returns in March and we publish the data in autumn. This provides a snapshot in time and won't reflect any changes to green belt boundaries made since the local planning authorities submitted their annual returns.",
      "typology": "geography",
      "wikidata": "Q2734873",
      "wikipedia": "Green_belt_(United_Kingdom)",
      "entities": "",
      "themes": [
        "environment"
      ],
      "entity-count": {
        "dataset": "green-belt",
        "count": 190
      },
      "paint-options": {
        "colour": "#85994b"
      },
      "attribution": "os-open-data",
      "attribution-text": "Your use of OS OpenData is subject to the terms at http://os.uk/opendata/licence\nContains Ordnance Survey data © Crown copyright and database right 2026",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "greenbelt",
      "github-discussion": 45,
      "entity-minimum": 610000,
      "entity-maximum": 610999,
      "phase": "beta",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "designated.nationalPark": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "national-park",
      "dataset": "national-park",
      "description": "",
      "name": "National park",
      "plural": "National parks",
      "prefix": "statistical-geography",
      "text": "The administrative boundaries of [national park authorities](/dataset/national-park-authority) in England as provided by the ONS for the purposes of producing statistics.",
      "typology": "geography",
      "wikidata": "Q60256727",
      "wikipedia": "National_park",
      "entities": "",
      "themes": [
        "heritage"
      ],
      "entity-count": {
        "dataset": "national-park",
        "count": 10
      },
      "paint-options": {
        "colour": "#3DA52C"
      },
      "attribution": "ons-boundary",
      "attribution-text": "Source: Office for National Statistics licensed under the Open Government Licence v.3.0\nContains OS data © Crown copyright and database right 2026",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "national-parks-and-the-broads",
      "github-discussion": "",
      "entity-minimum": 520000,
      "entity-maximum": 520999,
      "phase": "beta",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "designated.WHS": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "historic-england",
      "dataset": "world-heritage-site-buffer-zone",
      "description": "",
      "name": "World heritage site buffer zone",
      "plural": "World heritage site buffer zones",
      "prefix": "",
      "text": "A [World Heritage Site](/dataset/world-heritage-site) may have a [buffer zone](https://whc.unesco.org/en/series/25/) with implications for planning.",
      "typology": "geography",
      "wikidata": "Q9259",
      "wikipedia": "World_Heritage_Site",
      "entities": "",
      "themes": [
        "heritage"
      ],
      "entity-count": {
        "dataset": "world-heritage-site-buffer-zone",
        "count": 9
      },
      "paint-options": {
        "colour": "#EB1EE5",
        "opacity": 0.2
      },
      "attribution": "historic-england",
      "attribution-text": "© Historic England 2026. Contains Ordnance Survey data © Crown copyright and database right 2026.\nThe Historic England GIS Data contained in this material was obtained on [date].\nThe most publicly available up to date Historic England GIS Data can be obtained from [HistoricEngland.org.uk](https://historicengland.org.uk).",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "world-heritage-sites",
      "github-discussion": "",
      "entity-minimum": 16110000,
      "entity-maximum": 16129999,
      "phase": "beta",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "flood": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "flood-risk-zone",
      "dataset": "flood-risk-zone",
      "description": "Area identified as being at risk of flooding from rivers or the sea",
      "name": "Flood risk zone",
      "plural": "Flood risk zones",
      "prefix": "",
      "text": "Flood zones are a guide produced by the Environment Agency to demonstrate the probability of river and sea flooding in areas across England. Flood zones are based on the likelihood of an area flooding, with flood zone 1 areas least likely to flood and flood zone 3 areas more likely to flood. \n\nThe flood zones were produced to help developers, councils and communities understand the flood risks present in specific locations or regions. Despite being a very useful indicator of an area’s flood risk, the zones cannot tell you whether a location will definitely flood or to what severity.",
      "typology": "geography",
      "wikidata": "",
      "wikipedia": "",
      "entities": "",
      "themes": [
        "environment"
      ],
      "entity-count": {
        "dataset": "flood-risk-zone",
        "count": 780636
      },
      "paint-options": "",
      "attribution": "crown-copyright",
      "attribution-text": "© Crown copyright and database right 2026",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "flood-risk-zones",
      "github-discussion": 46,
      "entity-minimum": 65000000,
      "entity-maximum": 65999999,
      "phase": "live",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "listed": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "listed-building",
      "dataset": "listed-building-outline",
      "description": "boundary of a listed building",
      "name": "Listed building outline",
      "plural": "Listed building outlines",
      "prefix": "",
      "text": "This dataset contains geospatial boundary or extent information about listings.\n\nIt can be used for identifying and protecting buildings of special architectural or historic interest, ensuring that any work on or near these properties requires special consent and design considerations to prevent harm to the building's significance.\n\nThis spatial data can help in planning applications, conservation efforts, and policy development by showing the locations and boundaries of designated heritage assets, influencing development proposals and land use decisions. \n\nThis dataset does not consistently show the curtilage of listed buildings for planning purposes and should only be used as an indicative guide. We encourage users to make further checks before making any planning decision.\n\nData shows the extent of the land associated with the listing. This dataset is a work in progress and does not have full coverage across England.",
      "typology": "geography",
      "wikidata": "Q570600",
      "wikipedia": "Listed_building",
      "entities": "",
      "themes": [
        "heritage"
      ],
      "entity-count": {
        "dataset": "listed-building-outline",
        "count": 100742
      },
      "paint-options": {
        "colour": "#F9C744"
      },
      "attribution": "crown-copyright",
      "attribution-text": "© Crown copyright and database right 2026",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "listed-buildings",
      "github-discussion": 44,
      "entity-minimum": 42100000,
      "entity-maximum": 43099999,
      "phase": "alpha",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "monument": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "historic-england",
      "dataset": "scheduled-monument",
      "description": "",
      "name": "Scheduled monument",
      "plural": "Scheduled monuments",
      "prefix": "",
      "text": "Historic buildings or sites such as Roman remains, burial mounds, castles, bridges, earthworks, the remains of deserted villages and industrial sites can be designated scheduled monuments by the Secretary of State for [Digital, Culture, Media and Sport](https://www.gov.uk/government/organisations/department-for-digital-culture-media-sport). \n\nThis list of scheduled monuments is kept and maintained by [Historic England](https://historicengland.org.uk/).",
      "typology": "geography",
      "wikidata": "Q219538",
      "wikipedia": "Scheduled_monument",
      "entities": "",
      "themes": [
        "heritage"
      ],
      "entity-count": {
        "dataset": "scheduled-monument",
        "count": 20139
      },
      "paint-options": {
        "colour": "#0F9CDA"
      },
      "attribution": "historic-england",
      "attribution-text": "© Historic England 2026. Contains Ordnance Survey data © Crown copyright and database right 2026.\nThe Historic England GIS Data contained in this material was obtained on [date].\nThe most publicly available up to date Historic England GIS Data can be obtained from [HistoricEngland.org.uk](https://historicengland.org.uk).",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "scheduled-monuments",
      "github-discussion": "",
      "entity-minimum": 13900000,
      "entity-maximum": 13999999,
      "phase": "beta",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "nature.ASNW": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "ancient-woodland",
      "dataset": "ancient-woodland",
      "description": "An area that’s been wooded continuously since at least 1600 AD",
      "name": "Ancient woodland",
      "plural": "Ancient woodlands",
      "prefix": "",
      "text": "An area designated as ancient woodland by Natural England.\n\nNatural England and Forestry Commission [Guidance](https://www.gov.uk/guidance/ancient-woodland-and-veteran-trees-protection-surveys-licences)  is used in planning decisions.",
      "typology": "geography",
      "wikidata": "Q3078732",
      "wikipedia": "Ancient_woodland",
      "entities": "",
      "themes": [
        "environment"
      ],
      "entity-count": {
        "dataset": "ancient-woodland",
        "count": 44373
      },
      "paint-options": {
        "colour": "#00703c",
        "opacity": 0.2
      },
      "attribution": "natural-england",
      "attribution-text": "© Natural England copyright. Contains Ordnance Survey data © Crown copyright and database right 2026.",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "ancient-woodlands",
      "github-discussion": 32,
      "entity-minimum": 110000000,
      "entity-maximum": 129999999,
      "phase": "live",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "nature.ramsarSite": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "ramsar",
      "dataset": "ramsar",
      "description": "",
      "name": "Ramsar site",
      "plural": "Ramsar sites",
      "prefix": "",
      "text": "An internationally protected site listed as a wetland of international importance.\nRamsar sites are designated by [UNESCO](https://en.unesco.org/) and managed by [Natural England](https://www.gov.uk/government/organisations/natural-england).\n\nNatural England provides [guidance ](https://www.gov.uk/guidance/protected-sites-and-areas-how-to-review-planning-applications) to help local authorities decide on planning applications in protected sites and areas.",
      "typology": "geography",
      "wikidata": "",
      "wikipedia": "",
      "entities": "",
      "themes": [
        "environment"
      ],
      "entity-count": {
        "dataset": "ramsar",
        "count": 73
      },
      "paint-options": {
        "colour": "#7fcdff"
      },
      "attribution": "natural-england",
      "attribution-text": "© Natural England copyright. Contains Ordnance Survey data © Crown copyright and database right 2026.",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "ramsar",
      "github-discussion": 41,
      "entity-minimum": 612000,
      "entity-maximum": 619999,
      "phase": "beta",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "nature.SAC": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "special-area-of-conservation",
      "dataset": "special-area-of-conservation",
      "description": "",
      "name": "Special area of conservation",
      "plural": "Special areas of conservation",
      "prefix": "",
      "text": "Special areas of conservation (SACs) are area of land which have been designated by\n[DEFRA](https://www.gov.uk/government/organisations/department-for-environment-food-rural-affairs),\nwith advice from the [Joint Nature Conservation Committee](https://jncc.gov.uk/),\nto protect specific habitats and species.\n\nDEFRA and [Natural England](https://www.gov.uk/government/organisations/natural-england) publish\n[guidance](https://www.gov.uk/guidance/protected-sites-and-areas-how-to-review-planning-applications)\non how to review planning applications in protected sites and areas.",
      "typology": "geography",
      "wikidata": "Q1191622",
      "wikipedia": "Special_Area_of_Conservation",
      "entities": "",
      "themes": [
        "environment"
      ],
      "entity-count": {
        "dataset": "special-area-of-conservation",
        "count": 260
      },
      "paint-options": {
        "colour": "#7A8705"
      },
      "attribution": "natural-england",
      "attribution-text": "© Natural England copyright. Contains Ordnance Survey data © Crown copyright and database right 2026.",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "special-areas-of-conservation",
      "github-discussion": "",
      "entity-minimum": 14800000,
      "entity-maximum": 14899999,
      "phase": "beta",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "nature.SPA": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "special-protection-area",
      "dataset": "special-protection-area",
      "description": "",
      "name": "Special protection area",
      "plural": "Special protection areas",
      "prefix": "",
      "text": "[Special protection areas](https://naturalengland-defra.opendata.arcgis.com/maps/Defra::special-protection-areas-england/about) is an area designated \nfor the protection of birds and wildlife. This dataset is provided by [Natural England](https://www.gov.uk/government/organisations/natural-england).",
      "typology": "geography",
      "wikidata": "",
      "wikipedia": "",
      "entities": "",
      "themes": [
        "environment"
      ],
      "entity-count": {
        "dataset": "special-protection-area",
        "count": 88
      },
      "paint-options": "",
      "attribution": "natural-england",
      "attribution-text": "© Natural England copyright. Contains Ordnance Survey data © Crown copyright and database right 2026.",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "special-protection-areas",
      "github-discussion": "",
      "entity-minimum": 14900000,
      "entity-maximum": 14999999,
      "phase": "beta",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "nature.SSSI": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "site-of-special-scientific-interest",
      "dataset": "site-of-special-scientific-interest",
      "description": "",
      "name": "Site of special scientific interest",
      "plural": "Sites of special scientific interest",
      "prefix": "",
      "text": "Sites of special scientific interest (SSSI) are nationally protected sites that have features such as wildlife or geology. \n\nSSSIs are designated by [Natural England](https://www.gov.uk/government/organisations/natural-england).\nThere is [guidance](https://www.gov.uk/guidance/protected-areas-sites-of-special-scientific-interest) to help local authorities decide on planning applications in protected SSSIs.",
      "typology": "geography",
      "wikidata": "Q422211",
      "wikipedia": "Site_of_Special_Scientific_Interest",
      "entities": "",
      "themes": [
        "environment"
      ],
      "entity-count": {
        "dataset": "site-of-special-scientific-interest",
        "count": 4128
      },
      "paint-options": {
        "colour": "#308fac"
      },
      "attribution": "natural-england",
      "attribution-text": "© Natural England copyright. Contains Ordnance Survey data © Crown copyright and database right 2026.",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "sites-of-special-scientific-interest",
      "github-discussion": "",
      "entity-minimum": 14500000,
      "entity-maximum": 14599999,
      "phase": "beta",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "registeredPark": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "historic-england",
      "dataset": "park-and-garden",
      "description": "",
      "name": "Historic parks and gardens",
      "plural": "Parks and gardens",
      "prefix": "",
      "text": "Historic parks and gardens as listed by [Historic England](https://historicengland.org.uk/) in the [Register of Parks and Gardens of Special Historic Interest](https://historicengland.org.uk/listing/what-is-designation/registered-parks-and-gardens/).",
      "typology": "geography",
      "wikidata": "Q6975250",
      "wikipedia": "Register_of_Historic_Parks_and_Gardens_of_Special_Historic_Interest_in_England",
      "entities": "",
      "themes": [
        "environment",
        "heritage"
      ],
      "entity-count": {
        "dataset": "park-and-garden",
        "count": 1722
      },
      "paint-options": {
        "colour": "#0EB951"
      },
      "attribution": "historic-england",
      "attribution-text": "© Historic England 2026. Contains Ordnance Survey data © Crown copyright and database right 2026.\nThe Historic England GIS Data contained in this material was obtained on [date].\nThe most publicly available up to date Historic England GIS Data can be obtained from [HistoricEngland.org.uk](https://historicengland.org.uk).",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "",
      "github-discussion": "",
      "entity-minimum": 11100000,
      "entity-maximum": 11199999,
      "phase": "beta",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    },
    "tpo": {
      "entry-date": "",
      "start-date": "",
      "end-date": "",
      "collection": "tree-preservation-order",
      "dataset": "tree-preservation-zone",
      "description": "An area covered by a tree preservation order",
      "name": "Tree preservation zone",
      "plural": "Trees preservation zones",
      "prefix": "",
      "text": "This dataset contains the extent of groups of trees covered by a tree preservation order.\n\nIt can be used for managing and protecting important trees by preventing their unauthorised removal or damage. \n\nMembers of the public and developers use the data to check if a tree is protected and to inform planning applications or tree work proposals. The data helps ensure trees remain a significant part of the local environment and public amenity.\n\nThis dataset contains data from [a small group of local planning authorities](/about/) who we are working with to develop a [data specification for tree preservation orders](https://www.digital-land.info/guidance/specifications/tree-preservation-order).",
      "typology": "geography",
      "wikidata": "Q10884",
      "wikipedia": "Tree",
      "entities": "",
      "themes": [
        "environment"
      ],
      "entity-count": {
        "dataset": "tree-preservation-zone",
        "count": 72432
      },
      "paint-options": "",
      "attribution": "crown-copyright",
      "attribution-text": "© Crown copyright and database right 2026",
      "licence": "ogl3",
      "licence-text": "Licensed under the [Open Government Licence v.3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).",
      "consideration": "tree-preservation-orders",
      "github-discussion": 43,
      "entity-minimum": 19100000,
      "entity-maximum": 29099999,
      "phase": "beta",
      "realm": "dataset",
      "replacement-dataset": "",
      "version": ""
    }
  }
};
