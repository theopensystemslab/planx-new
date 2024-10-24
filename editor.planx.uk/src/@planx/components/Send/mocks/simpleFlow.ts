import { Graph } from "@planx/graph";

export const flow: Graph = {
  _root: {
    edges: ["findProperty", "send"],
  },
  send: {
    data: {
      tags: [],
      title: "Send",
      destinations: ["bops", "uniform"],
    },
    type: 650,
  },
  findProperty: {
    data: {
      title: "Find the property",
      newAddressTitle:
        "Click or tap at where the property is on the map and name it below",
      allowNewAddresses: false,
      newAddressDescription:
        "You will need to select a location and provide a name to continue",
      newAddressDescriptionLabel: "Name the site",
    },
    type: 9,
  },
};