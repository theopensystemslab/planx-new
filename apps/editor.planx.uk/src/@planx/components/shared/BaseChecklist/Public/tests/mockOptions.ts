import type { GroupedChecklist } from "@planx/components/Checklist/model";
import { Option } from "@planx/components/Option/model";
import {
  ChecklistLayout,
  type Group,
} from "@planx/components/shared/BaseChecklist/model";
import { PublicProps } from "@planx/components/shared/types";

export const options: {
  [key in ChecklistLayout]?: Option[];
} = {
  [ChecklistLayout.Basic]: [
    {
      id: "flat_id",
      data: {
        text: "Flat",
      },
    },
    {
      id: "caravan_id",
      data: {
        text: "Caravan",
        description: "A caravan is a temporary structure.",
      },
    },
    {
      id: "house_id",
      data: {
        text: "House",
        description: "A house can be detached, semi-detached or terraced.",
      },
    },
    {
      id: "spaceship_id",
      data: {
        text: "Spaceship",
      },
    },
  ],
  [ChecklistLayout.Images]: [
    {
      id: "flat_id",
      data: {
        text: "Flat",
        img: "flat.jpg",
      },
    },
    {
      id: "caravan_id",
      data: {
        text: "Caravan",
        img: "caravan.jpg",
      },
    },
    {
      id: "house_id",
      data: {
        text: "House",
        img: "house.jpg",
      },
    },
    {
      id: "spaceship_id",
      data: {
        text: "Spaceship",
        img: "spaceship.jpg",
      },
    },
  ],
};

export const optionsWithExclusiveOption: Array<Option> = [
  ...(options[ChecklistLayout.Basic] || []),
  { id: "tent_id", data: { text: "Tent", exclusive: true } },
];

export const groupedOptions: Array<Group<Option>> = [
  {
    title: "Section 1",
    children: [
      {
        id: "S1_Option1",
        data: {
          text: "S1 Option1",
        },
      },
      {
        id: "S1_Option2",
        data: {
          text: "S1 Option2",
          description: "S1 Option2 has a description",
        },
      },
    ],
  },
  {
    title: "Section 2",
    children: [
      {
        id: "S2_Option1",
        data: {
          text: "S2 Option1",
        },
      },
      {
        id: "S2_Option2",
        data: {
          text: "S2 Option2",
        },
      },
    ],
  },
  {
    title: "Section 3",
    children: [
      {
        id: "S3_Option1",
        data: {
          text: "S3 Option1",
        },
      },
      {
        id: "S3_Option2",
        data: {
          text: "S3 Option2",
        },
      },
    ],
  },
];

export const groupedOptionsWithExclusiveOption: Array<Group<Option>> = [
  {
    title: "Section 1",
    children: [
      {
        id: "S1_Option1",
        data: {
          text: "S1 Option1",
        },
      },
    ],
  },
  {
    title: "Section 2",
    children: [
      {
        id: "S2_Option1",
        data: {
          text: "S2 Option1",
        },
      },
      {
        id: "S2_Option2",
        data: {
          text: "S2 Option2",
        },
      },
    ],
  },
  {
    title: "Exclusive 'Or' Option",
    exclusive: true,
    children: [
      {
        id: "exclusive_option",
        data: {
          text: "Exclusive",
          exclusive: true,
        },
      },
    ],
  },
];

export const mockWithRepeatedOptions: PublicProps<GroupedChecklist> = {
  fn: "proposal.projectType",
  tags: [],
  text: "List the changes involved in the project",
  categories: [
    {
      count: 8,
      title: "Common projects for homes",
    },
    {
      count: 7,
      title: "Extensions",
    },
    {
      count: 4,
      title: "Roof ",
    },
    {
      count: 5,
      title: "External walls",
    },
    {
      count: 7,
      title: "Windows and doors",
    },
    {
      count: 3,
      title: "Internal projects",
    },
    {
      count: 5,
      title: "Garden and outdoors",
    },
    {
      count: 9,
      title: "Change the use ",
    },
    {
      count: 4,
      title: "Demolish",
    },
    {
      count: 6,
      title: "Utilities",
    },
    {
      count: 6,
      title: "Electricals",
    },
    {
      count: 1,
      title: "Or",
    },
  ],
  allRequired: false,
  description:
    "<p>Select only as many as you need to describe the project. <br><br>If you select <em>Add a rear or side extension (or conservatory):</em> </p><ul><li><p>the service includes windows, doors and a roof, so </p></li><li><p>you don&apos;t also need to select <em>Add new doorways or windows</em> if they are part of that extension.</p></li></ul>",
  neverAutoAnswer: false,
  alwaysAutoAnswerBlank: false,
  groupedOptions: [
    {
      title: "Common projects for homes",
      children: [
        {
          id: "2zIVEYaAzb",
          data: {
            val: "extend.rear",
            text: "Rear or side extension (or conservatory)",
          },
        },
        {
          id: "Uw3nlbQHu1",
          data: {
            val: "extend.roof",
            text: "Roof extension",
          },
        },
        {
          id: "sr0FePbzRe",
          data: {
            val: "extend.roof.dormer",
            text: "Add roof dormers",
          },
        },
        {
          id: "X7Co5Vmbap",
          data: {
            val: "changeOfUse.workFromHome",
            text: "Use an existing room as a home office",
          },
        },
        {
          id: "KLpvK5WAII",
          data: {
            val: "changeOfUse.annexe",
            text: "Convert part of the property into a granny flat",
          },
        },
        {
          id: "YKPGbQZ8s8",
          data: {
            val: "alter.equipment.solar",
            text: "Solar panels",
          },
        },
        {
          id: "h5PxKxKUn2",
          data: {
            val: "alter.replace",
            text: "Replace windows or doors",
          },
        },
        {
          id: "P8DW2oukWW",
          data: {
            val: "alter.highways.dropKerb",
            text: "Add a dropped kerb",
          },
        },
      ],
    },
    {
      title: "Extensions",
      children: [
        {
          id: "NNu5s3i77G",
          data: {
            val: "extend.porch",
            text: "Add or change a porch",
          },
        },
        {
          id: "3VA5tnu20b",
          data: {
            val: "extend.rear",
            text: "Rear or side extension",
          },
        },
        {
          id: "PX3qXLQk50",
          data: {
            val: "extend.front",
            text: "Front extension",
          },
        },
        {
          id: "9r1IjubH9a",
          data: {
            val: "extend.roof",
            text: "Roof extension",
          },
        },
        {
          id: "6bsiCLnQ4L",
          data: {
            val: "extend.basement",
            text: "Basement extension",
          },
        },
        {
          id: "GYwdRtratu",
          data: {
            val: "extend.roof.newStorey",
            text: "New storey (or level)",
          },
        },
        {
          id: "8wHsjAcrp3",
          data: {
            val: "alter.balcony",
            text: "Balcony",
          },
        },
      ],
    },
    {
      title: "Roof ",
      children: [
        {
          id: "wkstO8dD6Q",
          data: {
            val: "extend.roof.dormer",
            text: "Add roof dormers",
          },
        },
        {
          id: "9S7YLUj3uN",
          data: {
            val: "alter.roof.materials",
            text: "Replace or change the roof materials",
          },
        },
        {
          id: "eIHSVGExGi",
          data: {
            val: "alter.rooflight",
            text: "Add skylights to an existing roof",
          },
        },
        {
          id: "1ZVqvKuEZq",
          data: {
            val: "alter.roof.shape",
            text: "Change the shape of the roof",
          },
        },
      ],
    },
    {
      title: "External walls",
      children: [
        {
          id: "DgotzvVaLB",
          data: {
            val: "alter.facades",
            text: "Change material or colour",
          },
        },
        {
          id: "iNOkPcvaCZ",
          data: {
            val: "alter.staircase",
            text: "Add or change an external staircase (or access ramp)",
          },
        },
        {
          id: "s8EmIw4Ivw",
          data: {
            val: "alter.chimneys",
            text: "Alter chimneys",
          },
        },
        {
          id: "8W6lzkDWC3",
          data: {
            val: "alter.roof.roofTerrace",
            text: "Add a roof terrace",
          },
        },
        {
          id: "NPADimhNwf",
          data: {
            val: "alter.balcony",
            text: "Change or add a balcony",
          },
        },
      ],
    },
    {
      title: "Windows and doors",
      children: [
        {
          id: "g5EdprSLTU",
          data: {
            val: "alter.openings.add",
            text: "Add new doorways or windows",
          },
        },
        {
          id: "DJjzRcEwWK",
          data: {
            val: "alter.repair",
            text: "Repair windows or doors",
          },
        },
        {
          id: "GLgXcmBriw",
          data: {
            val: "alter.replace",
            text: "Replace windows or doors",
          },
        },
        {
          id: "t054SPccf3",
          data: {
            val: "alter.openings.alter",
            text: "Change the size of doorways or windows",
          },
        },
        {
          id: "J4OnnNhjQU",
          data: {
            val: "alter.openings.remove",
            text: "Block up doorways or windows",
          },
        },
        {
          id: "3sDyHMqlL9",
          data: {
            val: "alter.bayWindow",
            text: "Add or remove a bay window",
          },
        },
        {
          id: "Dig4WtCENf",
          data: {
            val: "alter.secondaryGlazing",
            text: "Add secondary glazing to a window",
          },
        },
      ],
    },
    {
      title: "Internal projects",
      children: [
        {
          id: "5YM4bcFdY9",
          data: {
            val: "internal.loft",
            text: "Convert a loft",
          },
        },
        {
          id: "8PX8V0iCyO",
          data: {
            val: "internal",
            text: "Change the internal layout",
          },
        },
        {
          id: "xH8BjPYUOT",
          data: {
            val: "internal",
            text: "Internal building works",
            flags: ["flag.pp.notDevelopment"],
          },
        },
      ],
    },
    {
      title: "Garden and outdoors",
      children: [
        {
          id: "DUWT36iW4O",
          data: {
            val: "extend.outbuilding",
            text: "Add an outbuilding (or shed, carport, garage, or garden office)",
          },
        },
        {
          id: "ZLtpXgWWC8",
          data: {
            val: "alter.surfaces.deck",
            text: "Add or change a decked area",
          },
        },
        {
          id: "B3giCOA8jT",
          data: {
            val: "alter.surfaces.patio",
            text: "Add or change a patio or paved area",
          },
        },
        {
          id: "kuVLjWn1nE",
          data: {
            val: "alter.surfaces.parking",
            text: "Add or change a driveway or parking area",
          },
        },
        {
          id: "kF58WogbMW",
          data: {
            val: "alter.boundary",
            text: "Changes to a fence, wall or gate",
          },
        },
      ],
    },
    {
      title: "Change the use ",
      children: [
        {
          id: "SgRMlQwPVw",
          data: {
            val: "changeOfUse.outbuilding",
            text: "Convert an outbuilding",
          },
        },
        {
          id: "Iqtkr6bP4S",
          data: {
            val: "changeOfUse.part",
            text: "Convert part of a property",
          },
        },
        {
          id: "U2anKDJDcl",
          data: {
            val: "changeOfUse.whole",
            text: "Change the use of a property",
          },
        },
        {
          id: "0YHHQjSO7v",
          data: {
            val: "changeOfUse.land",
            text: "Change the use of land",
          },
        },
        {
          id: "7EK5hNsHsC",
          data: {
            val: "internal.loft",
            text: "Convert a loft",
          },
        },
        {
          id: "hY4YFiWy5T",
          data: {
            val: "changeOfUse.let.whole",
            text: "Let a whole property",
          },
        },
        {
          id: "3ry6ixjdWe",
          data: {
            val: "changeOfUse.let.part",
            text: "Let part of a property",
          },
        },
        {
          id: "xfEAiCJ412",
          data: {
            val: "changeOfUse.whole.homeToHMO",
            text: "Share a home",
          },
        },
        {
          id: "796EbBR9Ch",
          data: {
            val: "changeOfUse.caravans",
            text: "Use a caravan or mobile home on the property",
          },
        },
      ],
    },
    {
      title: "Demolish",
      children: [
        {
          id: "fry6EmjPUE",
          data: {
            val: "demolish.part",
            text: "Part of a building (such as an extension)",
          },
        },
        {
          id: "KcUJtkhmoQ",
          data: {
            val: "demolish.full",
            text: "Whole building",
          },
        },
        {
          id: "uwcdv6cdhR",
          data: {
            val: "demolish.outbuilding",
            text: "Outbuilding (such as a garage or barn)",
          },
        },
        {
          id: "NkvFpWswHg",
          data: {
            val: "demolish.boundary",
            text: "Fence, gate or boundary wall",
          },
        },
      ],
    },
    {
      title: "Utilities",
      children: [
        {
          id: "7XELRJwSVj",
          data: {
            val: "alter.equipment.tank",
            text: "Install an outdoor tank (for example a water tank)",
          },
        },
        {
          id: "m85PRTnAwE",
          data: {
            val: "alter.soilPipes",
            text: "Add or replace a soil pipe",
          },
        },
        {
          id: "PkyRghnvrD",
          data: {
            val: "alter.cables",
            text: "Install underground cables",
          },
        },
        {
          id: "pdYZIbV3Jf",
          data: {
            val: "alter.drains",
            text: "Work on drains",
          },
        },
        {
          id: "2eGMbzW3lZ",
          data: {
            val: "alter.equipment.antennae",
            text: "Install a satellite dish or aerial",
          },
        },
        {
          id: "Rta6WKw5af",
          data: {
            val: "alter.remove.equipment",
            text: "Remove equipment",
          },
        },
      ],
    },
    {
      title: "Electricals",
      children: [
        {
          id: "Sn7PPH6OJH",
          data: {
            val: "alter.equipment.charging",
            text: "Install a car charging point",
          },
        },
        {
          id: "64CX1Wsz5o",
          data: {
            val: "alter.equipment.heatPump.air",
            text: "Install an air source heat pump",
          },
        },
        {
          id: "u687RZvoyd",
          data: {
            val: "alter.equipment.wifi",
            text: "Install an external wifi box",
            flags: ["flag.pp.notDevelopment"],
          },
        },
        {
          id: "apNdjuhRB6",
          data: {
            val: "alter.equipment.alarm",
            text: "Security alarms",
            flags: ["flag.pp.notDevelopment"],
          },
        },
        {
          id: "HAZCIWkgAS",
          data: {
            val: "alter.equipment.lighting",
            text: "Outdoor lights",
          },
        },
        {
          id: "dfcgDkR2oD",
          data: {
            val: "alter.equipment.cctv",
            text: "CCTV cameras",
          },
        },
      ],
    },
    {
      title: "Or",
      children: [
        {
          id: "V69z8B4VQW",
          data: {
            text: "See more changes",
            exclusive: true,
          },
        },
      ],
    },
  ],
  id: "B6NK7eMeBL",
};
