import { Schema } from "../model";

export const ResidentialUnits: Schema = {
  type: "Residential Units",
  fields: [
    {
      type: "question",
      data: {
        title: "What type of change are you making?",
        fn: "changeType",
        options: [
          { id: "proposed", data: { text: "Proposed" } },
          { id: "existing", data: { text: "Existing" } },
        ],
      },
    },
    {
      type: "question",
      unique: true,
      data: {
        title: "What is the tenure type?",
        fn: "tenureType",
        options: [
          { id: "marketHousing", data: { text: "Market housing" } },
          {
            id: "socialAffordableRent",
            data: { text: "Social and affordable rent" },
          },
          {
            id: "affordableHomeOwnership",
            data: { text: "Affordable home ownership" },
          },
          { id: "starterHome", data: { text: "Starter homes" } },
          { id: "selfBuild", data: { text: "Self build" } },
        ],
      },
    },
    {
      type: "question",
      data: {
        title: "What is the unit type?",
        fn: "unitType",
        options: [
          { id: "houses", data: { text: "Houses" } },
          { id: "flats", data: { text: "Flats" } },
          { id: "bedsits", data: { text: "Bedsits" } },
          { id: "starterHome", data: { text: "Starter homes" } },
          { id: "shelteredHousing", data: { text: "Sheltered housing" } },
          { id: "clusteredFlats", data: { text: "Clustered flats" } },
          { id: "other", data: { text: "Other" } },
        ],
      },
    },
    {
      type: "number",
      data: {
        title: "How many bedrooms are there?",
        fn: "numberBedrooms",
        allowNegatives: false,
      },
    },
    {
      type: "number",
      data: {
        title:
          "How many residential units does the description above apply to?",
        fn: "numberIdenticalUnits",
        allowNegatives: false,
      },
    },
  ],
  min: 1,
} as const;
