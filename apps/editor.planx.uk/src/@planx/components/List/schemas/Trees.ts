import { Schema } from "@planx/components/shared/Schema/model";
import { TextInputType } from "@planx/components/TextInput/model";

export const Trees: Schema = {
  type: "Tree type",
  fields: [
    {
      type: "map",
      data: {
        title:
          "Click or tap the map to mark the position of a tree. Multiple trees can be added if they are of the same species, proposed work and reason. Markers can be removed by selecting the delete icon.",
        fn: "features",
        mapOptions: {
          basemap: "MapboxSatellite",
          drawType: "Point",
          drawColor: "#66ff00",
          drawMany: true,
        },
      },
    },
    {
      type: "text",
      data: {
        title: "Species",
        fn: "species",
        type: TextInputType.Short,
      },
    },
    {
      type: "text",
      required: false,
      data: {
        title: "Proposed work",
        fn: "work",
        type: TextInputType.Short,
      },
    },
    {
      type: "text",
      required: false,
      data: {
        title: "Reasons for the proposed work",
        fn: "reason",
        type: TextInputType.Short,
      },
    },
  ],
  min: 1,
} as const;
