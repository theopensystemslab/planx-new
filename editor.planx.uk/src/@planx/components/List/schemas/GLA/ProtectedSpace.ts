import { Schema } from "@planx/components/List/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const ProtectedSpaceGLA: Schema = {
  type: "Protected space details",
  fields: [
    {
      type: "question",
      data: {
        title: "What is the project's impact on this protected space?",
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
        title: "What best describes the designation of this protected space?",
        fn: "designation",
        options: [
          {
            id: "SSSI",
            data: { text: "Sites of Special Scientific Interest", val: "SSSI" },
          },
          {
            id: "localReserve",
            data: { text: "Local Nature Reserve", val: "localReserve" },
          },
          {
            id: "metropolitan",
            data: {
              text: "Site of Metropolitan Importance",
              val: "metropolitan",
            },
          },
          {
            id: "boroughGradeOne",
            data: {
              text: "Site of Borough Grade 1 Importance",
              val: "boroughGradeOne",
            },
          },
          {
            id: "boroughGradeTwo",
            data: {
              text: "Site of Borough Grade 2 Importance",
              val: "boroughGradeTwo",
            },
          },
          {
            id: "local",
            data: { text: "Site of Local Importance", val: "local" },
          },
          { id: "none", data: { text: "Not designated", val: "none" } },
        ],
      },
    },
    {
      type: "text",
      data: {
        title: "Describe the protected space",
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
  ],
  min: 1,
} as const;
