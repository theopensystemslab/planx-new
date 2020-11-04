import { mostReadable } from "@ctrl/tinycolor";

const flags = [
  // Planning permission

  {
    value: "MISSING_INFO",
    text: "Missing information",
    category: "Planning permission",
    bgColor: "#DBDBDB",
  },
  {
    value: "IMMUNE",
    text: "Immune",
    category: "Planning permission",
    bgColor: "#EFFFDA",
  },
  {
    value: "PLANNING_PERMISSION_REQUIRED",
    text: "Permission needed",
    category: "Planning permission",
    bgColor: "#909090",
  },
  {
    value: "PRIOR_APPROVAL",
    text: "Prior approval",
    category: "Planning permission",
    bgColor: "#FAFF00",
  },
  {
    value: "PP-NOTICE",
    text: "Notice",
    category: "Planning permission",
    bgColor: "#FEFFC1",
  },
  {
    value: "NO_APP_REQUIRED",
    text: "Permitted development",
    category: "Planning permission",
    bgColor: "#B6EE7E",
  },
  {
    value: "PP-NOT_DEVELOPMENT",
    text: "Not development",
    category: "Planning permission",
    bgColor: "#FFFFFF",
  },

  // Listed building consent

  {
    value: "LB-MISSING_INFO",
    text: "Missing information",
    category: "Listed building consent",
    bgColor: "#DBDBDB",
  },
  {
    value: "LB-REQUIRED",
    text: "Required",
    category: "Listed building consent",
    bgColor: "#FAFF00",
  },
  {
    value: "LB-DE_MINIMIS",
    text: "De minimis",
    category: "Listed building consent",
    bgColor: "#B6EE7E",
  },
  {
    value: "LB-NOT_REQUIRED",
    text: "Not required",
    category: "Listed building consent",
    bgColor: "#FFFFFF",
  },

  // Works to trees

  {
    value: "TR-MISSING_INFO",
    text: "Missing information",
    category: "Works to trees",
    bgColor: "#DBDBDB",
  },
  {
    value: "TR-REQUIRED",
    text: "Required",
    category: "Works to trees",
    bgColor: "#FAFF00",
  },
  {
    value: "TR-DE_MINIMIS",
    text: "De minimis",
    category: "Works to trees",
    bgColor: "#B4BBFF",
  },
  {
    value: "TR-NOT_REQUIRED",
    text: "Not required",
    category: "Works to trees",
    bgColor: "#FFF",
  },

  // Demolition in a conservation area

  {
    value: "DC-MISSING_INFO",
    text: "Missing information",
    category: "Demolition in a conservation area",
    bgColor: "#DBDBDB",
  },
  {
    value: "DC-REQUIRED",
    text: "Required",
    category: "Demolition in a conservation area",
    bgColor: "#FF5C00",
  },
  {
    value: "DC-DE_MINIMIS",
    text: "De minimis",
    category: "Demolition in a conservation area",
    bgColor: "#FFC2A0",
  },
  {
    value: "DC-NOT_REQUIRED",
    text: "Not required",
    category: "Demolition in a conservation area",
    bgColor: "#FFF",
  },

  // Planning policy

  {
    value: "PO_MISSING_INFO",
    text: "Missing information",
    category: "Planning policy",
    bgColor: "#DBDBDB",
  },
  {
    value: "LIKELY_FAIL",
    text: "Fails to meet policy",
    category: "Planning policy",
    bgColor: "#FF001F",
  },
  {
    value: "EDGE_CASE",
    text: "Edge case",
    category: "Planning policy",
    bgColor: "#FFA800",
  },
  {
    value: "LIKELY_PASS",
    text: "Meets policy",
    category: "Planning policy",
    bgColor: "#63C501",
  },

  // Community infrastructure levy

  {
    value: "CO_MISSING_INFO",
    text: "Missing information",
    category: "Community infrastructure levy",
    bgColor: "#DBDBDB",
  },
  {
    value: "CO_EXEMPTION_VOID",
    text: "Exemption void",
    category: "Community infrastructure levy",
    bgColor: "#CDB1C2",
  },
  {
    value: "CO_EXEMPT",
    text: "Exempt",
    category: "Community infrastructure levy",
    bgColor: "#FFDEF2",
  },
  {
    value: "CO_RELIEF_VOID",
    text: "Relief void",
    category: "Community infrastructure levy",
    bgColor: "#A4698C",
  },
  {
    value: "CO_RELIEF",
    text: "Relief",
    category: "Community infrastructure levy",
    bgColor: "#FFA4DA",
  },
  {
    value: "CO_LIABLE",
    text: "Liable",
    category: "Community infrastructure levy",
    bgColor: "#FF0099",
  },
  {
    value: "CO_NOT_LIABLE",
    text: "Not liable",
    category: "Community infrastructure levy",
    bgColor: "#FFF",
  },
].map((f: any) => ({
  ...f,
  color: mostReadable(f.bgColor, ["#000", "#FFF"]),
}));

export default flags;
