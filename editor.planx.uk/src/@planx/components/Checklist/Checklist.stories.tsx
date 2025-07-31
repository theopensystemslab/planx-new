import { Meta, StoryObj } from "@storybook/react";

import Checklist from "./Public/Public";

const meta = {
  title: "PlanX Components/Checklist",
  component: Checklist,
  argTypes: {
    handleSubmit: { action: true, control: { disable: true } },
  },
} satisfies Meta<typeof Checklist>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic = {
  args: {
    text: "List the changes involved in the project",
    description: "Select only as many as you need to describe the project.",
    howMeasured:
      "The term 'changes' includes both physical works and changes in the use of the property, if appropriate.",
    options: [
      { id: "a", data: { val: "a", text: "Repair windows or doors" } },
      { id: "b", data: { val: "b", text: "Changes to trees or hedges" } },
      { id: "c", data: { val: "c", text: "Install a swimming pool" } },
    ],
    allRequired: false,
  },
} satisfies Story;

export const Grouped = {
  args: {
    text: "List the changes involved in the project",
    description: "Select only as many as you need to describe the project.",
    howMeasured:
      "The term 'changes' includes both physical works and changes in the use of the property, if appropriate.",
    groupedOptions: [
      {
        title: "Windows, doors and shopfronts",
        children: [
          { id: "a", data: { val: "a", text: "Repair windows or doors" } },
          { id: "b", data: { val: "b", text: "Add or alter shutters" } },
        ],
      },
      {
        title: "Garden and outdoors",
        children: [
          { id: "c", data: { val: "c", text: "Changes to trees or hedges" } },
          { id: "d", data: { val: "d", text: "Install a swimming pool" } },
          {
            id: "e",
            data: {
              val: "e",
              text: "Changes to a public road, pavement or path (including drop kerb)",
            },
          },
        ],
      },
    ],
  },
} satisfies Story;

export const WithDescriptions = {
  args: {
    text: "List the changes involved in the project",
    description: "Select only as many as you need to describe the project.",
    howMeasured:
      "The term 'changes' includes both physical works and changes in the use of the property, if appropriate.",
    options: [
      { id: "a", data: { val: "a", text: "Repair windows or doors" } },
      {
        id: "b",
        data: {
          val: "b",
          text: "Changes to trees or hedges",
          description:
            "This includes trimming, fully removing, and planting new trees or hedges.",
        },
      },
      {
        id: "c",
        data: {
          val: "c",
          text: "Install a swimming pool",
          description:
            "This option alone does not include any outbuildings, fences, or landscaping.",
        },
      },
    ],
    allRequired: false,
  },
} satisfies Story;

export const WithImages = {
  args: {
    text: "What do you want to do to the roof?",
    description: "Select all that apply",
    options: [
      {
        id: "a",
        data: {
          val: "a",
          text: "Add dormers",
          img: "https://planx-temp.s3.eu-west-2.amazonaws.com/production/0pyd8i7c/4.4_roof-extensions_SemiD_Roof_extensiontype_reardormer.svg",
        },
      },
      {
        id: "b",
        data: {
          val: "b",
          text: "Convert a hip roof to a gable",
          img: "https://planx-temp.s3.eu-west-2.amazonaws.com/production/2mlyvlia/4.4_roof-extensions_SemiD_Roof_extensiontype_hiptogable.svg",
        },
      },
      {
        id: "c",
        data: {
          val: "c",
          text: "Add a storey",
          img: "https://planx-temp.s3.eu-west-2.amazonaws.com/production/5oqr1hne/4.4_roof-extensions_SemiD_Roof_extensiontype_addstorey.svg",
        },
      },
    ],
  },
};

export const ExclusiveOr = {
  args: {
    text: "List the changes involved in the project",
    description: "Select only as many as you need to describe the project.",
    howMeasured:
      "The term 'changes' includes both physical works and changes in the use of the property, if appropriate.",
    options: [
      { id: "a", data: { val: "a", text: "Repair windows or doors" } },
      { id: "b", data: { val: "b", text: "Changes to trees or hedges" } },
      { id: "c", data: { val: "c", text: "Install a swimming pool" } },
      {
        id: "none",
        data: { val: "none", text: "None of the above", exclusive: true },
      },
    ],
    allRequired: false,
  },
} satisfies Story;

export const AllRequired = {
  args: {
    text: "I confirm that:",
    description: "",
    options: [
      {
        id: "agree",
        data: {
          text: "The information contained in this application is truthful, accurate and complete, to the best of my knowledge",
        },
      },
    ],
    allRequired: true,
  },
} satisfies Story;

export const WithRepeatedOptions = {
  args: {
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
  },
} satisfies Story;

// Similar to Question stories here, Checklist's editor atyipcally expects props so the Wrapper throws a type error - come back to!
// export const WithEditor = () => {
//   return <Wrapper Editor={<Editor handleSubmit={() => {}} />} Public={Checklist} />;
// };
