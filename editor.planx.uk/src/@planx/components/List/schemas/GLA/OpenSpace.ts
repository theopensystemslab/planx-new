import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const OpenSpaceGLA: Schema = {
  type: "Open space details",
  fields: [
    {
      type: "question",
      data: {
        title: "What is the project's impact on this open space?",
        fn: "development",
        options: [
          { id: "loss", data: { text: "Loss", val: "loss" } },
          { id: "gain", data: { text: "Gain", val: "gain" } },
          {
            id: "changeOfUse",
            data: { text: "Change of use", val: "changeOfUse" },
          },
        ],
      },
    },
    {
      type: "question",
      data: {
        title: "What best describes the type of this open space?",
        fn: "type",
        options: [
          { id: "park", data: { text: "Parks and gardens", val: "park" } },
          {
            id: "natural",
            data: { text: "Natural and semi-natural", val: "natural" },
          },
          {
            id: "greenCorridor",
            data: { text: "Green corridors", val: "greenCorridor" },
          },
          {
            id: "sport",
            data: { text: "Outdoor sports facilities", val: "sport" },
          },
          { id: "amenity", data: { text: "Amenity", val: "amenity" } },
          {
            id: "children",
            data: {
              text: "Provision for children and young people",
              val: "children",
            },
          },
          {
            id: "allotment",
            data: {
              text: "Allotments, community gardens and city farms",
              val: "allotment",
            },
          },
          {
            id: "burial",
            data: {
              text: "Cemeteries, churchyards and other burial grounds",
              val: "burial",
            },
          },
          {
            id: "fringe",
            data: { text: "Countryside in urban fringe areas", val: "fringe" },
          },
          { id: "civic", data: { text: "Civic spaces", val: "civic" } },
          {
            id: "brownfield",
            data: { text: "Brownfield land", val: "brownfield" },
          },
          {
            id: "nonResidential",
            data: {
              text: "Non-residential institution grounds or garden",
              val: "nonResidential",
            },
          },
          {
            id: "residential",
            data: { text: "Residential garden", val: "residential" },
          },
        ],
      },
    },
    {
      type: "question",
      data: {
        title: "What best describes the designation of this open space?",
        fn: "designation",
        options: [
          { id: "greenBelt", data: { text: "Green Belt", val: "greenBelt" } },
          {
            id: "metropolitan",
            data: { text: "Metropolitan Open Land", val: "metropolitan" },
          },
          { id: "local", data: { text: "Local Open Spaces", val: "local" } },
          { id: "other", data: { text: "Other designation", val: "other" } },
          { id: "none", data: { text: "Not designated", val: "none" } },
        ],
      },
    },
    {
      type: "text",
      data: {
        title: "Describe the open space",
        fn: "description",
        type: TextInputType.Long,
      },
    },
    {
      type: "question",
      data: {
        title: "What is the access to this open space?",
        fn: "access",
        options: [
          { id: "restricted", data: { text: "Restricted", val: "restricted" } },
          {
            id: "unrestricted",
            data: { text: "Unrestricted", val: "unrestricted" },
          },
        ],
      },
    },
    {
      type: "number",
      data: {
        title: "What is the area of this open space?",
        units: "ha",
        fn: "area",
        allowNegatives: false,
      },
    },
    {
      type: "question",
      data: {
        title: "Do the changes to this open space involve a land swap?",
        fn: "swap",
        options: [
          { id: "true", data: { text: "Yes", val: "true" } },
          { id: "false", data: { text: "No", val: "false" } },
        ],
      },
    },
  ],
  min: 1,
} as const;
