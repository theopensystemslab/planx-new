import { mostReadable } from "@ctrl/tinycolor";

// flags grouped by categories, order is significant, earlier flags === more important
// https://www.figma.com/file/bnUUrsVRG6qPwDkTmVKACI/Design?node-id=1971%3A0
const flags = {
  "Planning permission": {
    MISSING_INFO: { text: "Missing information", bgColor: "#DBDBDB" },
    IMMUNE: { text: "Immune", bgColor: "#EFFFDA" },
    PLANNING_PERMISSION_REQUIRED: {
      text: "Permission needed",
      bgColor: "#909090",
    },
    PRIOR_APPROVAL: { text: "Prior approval", bgColor: "#FAFF00" },
    "PP-NOTICE": { text: "Notice", bgColor: "#FEFFC1" },
    NO_APP_REQUIRED: { text: "Permitted development", bgColor: "#B6EE7E" },
    "PP-NOT_DEVELOPMENT": { text: "Not development", bgColor: "#FFFFFF" },
  },
  "Listed building consent": {
    "LB-MISSING_INFO": { text: "Missing information", bgColor: "#DBDBDB" },
    "LB-REQUIRED": { text: "Required", bgColor: "#FAFF00" },
    "LB-DE_MINIMIS": { text: "De minimis", bgColor: "#B6EE7E" },
    "LB-NOT_REQUIRED": { text: "Not required", bgColor: "#FFFFFF" },
  },
  "Works to trees & hedges": {
    "TR-MISSING_INFO": { text: "Missing information", bgColor: "#DBDBDB" },
    "TR-REQUIRED": { text: "Required", bgColor: "#FAFF00" },
    "TR-DE_MINIMIS": { text: "De minimis", bgColor: "#B4BBFF" },
    "TR-NOT_REQUIRED": { text: "Not required", bgColor: "#FFF" },
  },
  "Demolition in a conservation area": {
    "DC-MISSING_INFO": { text: "Missing information", bgColor: "#DBDBDB" },
    "DC-REQUIRED": { text: "Required", bgColor: "#FF5C00" },
    "DC-DE_MINIMIS": { text: "De minimis", bgColor: "#FFC2A0" },
    "DC-NOT_REQUIRED": { text: "Not required", bgColor: "#FFF" },
  },
  "Planning policy": {
    PO_MISSING_INFO: { text: "Missing information", bgColor: "#DBDBDB" },
    LIKELY_FAIL: { text: "Fails to meet policy", bgColor: "#FF001F" },
    EDGE_CASE: { text: "Edge case", bgColor: "#FFA800" },
    LIKELY_PASS: { text: "Meets policy", bgColor: "#63C501" },
  },
  "Community infrastructure levy": {
    CO_MISSING_INFO: { text: "Missing information", bgColor: "#DBDBDB" },
    CO_EXEMPTION_VOID: { text: "Exemption void", bgColor: "#CDB1C2" },
    CO_EXEMPT: { text: "Exempt", bgColor: "#FFDEF2" },
    CO_RELIEF_VOID: { text: "Relief void", bgColor: "#A4698C" },
    CO_RELIEF: { text: "Relief", bgColor: "#FFA4DA" },
    CO_LIABLE: { text: "Liable", bgColor: "#FF0099" },
    CO_NOT_LIABLE: { text: "Not liable", bgColor: "#FFF" },
  },
};

export const flatFlags = [];

export default Object.entries(flags).reduce((acc, [category, flags]) => {
  acc[category] = Object.entries(flags).reduce((acc, [id, flag]) => {
    // loop through all the flags and add a text color which is
    // white if it's a dark background or black if it's light
    const color = mostReadable(flag.bgColor, ["#000", "#FFF"]);

    acc[id] = {
      ...flag,
      color,
    };

    // check that no other flags share the same ID
    if (flatFlags.find((f) => f.id === id))
      throw new Error(`Multiple flags with same id (${id})`);

    // push the flag object to a flattened array for convenience
    flatFlags.push({ ...flag, id, category, color });

    return acc;
  }, {});
  return acc;
}, {});
