import { mostReadable } from "@ctrl/tinycolor";

// flags grouped by categories, order is significant, earlier flags === more important
// https://www.figma.com/file/bnUUrsVRG6qPwDkTmVKACI/Design?node-id=1971%3A0
const categoriesAndFlags = {
  "Planning permission": {
    MISSING_INFO: ["Missing information", "#DBDBDB"],
    IMMUNE: ["Immune", "#EFFFDA"],
    PLANNING_PERMISSION_REQUIRED: ["Permission needed", "#909090"],
    PRIOR_APPROVAL: ["Prior approval", "#FAFF00"],
    "PP-NOTICE": ["Notice", "#FEFFC1"],
    NO_APP_REQUIRED: ["Permitted development", "#B6EE7E"],
    "PP-NOT_DEVELOPMENT": ["Not development", "#FFFFFF"],
  },
  "Listed building consent": {
    "LB-MISSING_INFO": ["Missing information", "#DBDBDB"],
    "LB-REQUIRED": ["Required", "#FAFF00"],
    "LB-DE_MINIMIS": ["De minimis", "#B6EE7E"],
    "LB-NOT_REQUIRED": ["Not required", "#FFFFFF"],
  },
  "Works to trees & hedges": {
    "TR-MISSING_INFO": ["Missing information", "#DBDBDB"],
    "TR-REQUIRED": ["Required", "#FAFF00"],
    "TR-DE_MINIMIS": ["De minimis", "#B4BBFF"],
    "TR-NOT_REQUIRED": ["Not required", "#FFF"],
  },
  "Demolition in a conservation area": {
    "DC-MISSING_INFO": ["Missing information", "#DBDBDB"],
    "DC-REQUIRED": ["Required", "#FF5C00"],
    "DC-DE_MINIMIS": ["De minimis", "#FFC2A0"],
    "DC-NOT_REQUIRED": ["Not required", "#FFF"],
  },
  "Planning policy": {
    PO_MISSING_INFO: ["Missing information", "#DBDBDB"],
    LIKELY_FAIL: ["Fails to meet policy", "#FF001F"],
    EDGE_CASE: ["Edge case", "#FFA800"],
    LIKELY_PASS: ["Meets policy", "#63C501"],
  },
  "Community infrastructure levy": {
    CO_MISSING_INFO: ["Missing information", "#DBDBDB"],
    CO_EXEMPTION_VOID: ["Exemption void", "#CDB1C2"],
    CO_EXEMPT: ["Exempt", "#FFDEF2"],
    CO_RELIEF_VOID: ["Relief void", "#A4698C"],
    CO_RELIEF: ["Relief", "#FFA4DA"],
    CO_LIABLE: ["Liable", "#FF0099"],
    CO_NOT_LIABLE: ["Not liable", "#FFF"],
  },
};

export const flatFlags: Array<any> = [];

export default Object.entries(categoriesAndFlags).reduce(
  (acc: Record<string, any>, [category, flags]) => {
    acc[category] = Object.entries(flags).reduce(
      (acc: Record<string, any>, [id, [text, bgColor]]) => {
        // loop through all the flags and add a text color which is
        // white if it's a dark background or black if it's light
        const color =
          mostReadable(bgColor, ["#000", "#FFF"])?.toHexString() || "#000";

        acc[id] = {
          text,
          bgColor,
          color,
        };

        // check that no other flags share the same ID
        if (flatFlags.find((f: any) => f.id === id))
          throw new Error(`Multiple flags with same id (${id})`);

        // push the flag object to a flattened array for convenience
        flatFlags.push({ ...acc[id], value: id, category });

        return acc;
      },
      {}
    );
    return acc;
  },
  {}
);
