import { Schema } from "@planx/components/List/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const MaterialDetails: Schema = {
  type: "Material",
  fields: [
    {
      type: "question",
      data: {
        title: "Type",
        fn: "type",
        options: [
          { id: "wall", data: { text: "External walls", val: "wall" } },
          {
            id: "window",
            data: { text: "Windows", val: "window" },
          },
          { id: "door", data: { text: "Doors", val: "door" } },
          {
            id: "roof",
            data: { text: "Roof", val: "roof" },
          },
          {
            id: "boundary",
            data: {
              text: "Fences, walls and gates",
              val: "boundary",
            },
          },
          {
            id: "surface",
            data: { text: "External ground materials for access and parking", val: "surface" },
          },
          {
            id: "lighting",
            data: { text: "Lighting", val: "lighting" },
          },
          {
            id: "other",
            data: { text: "Others", val: "other" },
          },
        ],
      },
    },
    {
      type: "text",
      data: {
        title: "Existing material description",
        fn: "existing",
        type: TextInputType.Short,
      },
    },
    {
      type: "text",
      data: {
        title: "Proposed material description",
        fn: "proposed",
        type: TextInputType.Short,
      },
    },
  ],
  min: 1,
} as const;
