import { mostReadable } from "@ctrl/tinycolor";

const flags = [
  // Planning permission
  {
    value: "PP-NOT_DEVELOPMENT",
    text: "Not development",
    category: "Planning permission",
    bgColor: "#FFFFFF",
  },
  {
    value: "NO_APP_REQUIRED",
    text: "Permitted development",
    category: "Planning permission",
    bgColor: "#FFFFFF",
  },
  {
    value: "PP-NOTICE",
    text: "Notice",
    category: "Planning permission",
    bgColor: "#FEFFC1",
  },
  {
    value: "PRIOR_APPROVAL",
    text: "Prior approval",
    category: "Planning permission",
    bgColor: "#FAFF00",
  },
  {
    value: "PLANNING_PERMISSION_REQUIRED",
    text: "Permission needed",
    category: "Planning permission",
    bgColor: "#919191",
  },
  {
    value: "MISSING_INFO",
    text: "Missing information",
    category: "Planning permission",
    bgColor: "#DBDBDB",
  },
  // Listed building consent
  {
    value: "LB-NOT_REQUIRED",
    text: "Not required",
    category: "Listed building consent",
    bgColor: "#FFFFFF",
  },
  {
    value: "LB-DE_MINIMIS",
    text: "De minimis",
    category: "Listed building consent",
    bgColor: "#E2AEFB",
  },
  {
    value: "LB-REQUIRED",
    text: "Required",
    category: "Listed building consent",
    bgColor: "#AD00FF",
  },
  // {
  //   value: "LB-ADVICE_RECOMMENDED",
  //   text: "Advice recommended",
  //   category: "Listed Buildings",
  //   bgColor: "#7D70B3",
  // },
  // {
  //   value: "LB-LIKELY_REFUSAL",
  //   text: "Likely refusal",
  //   category: "Listed Buildings",
  //   bgColor: "#574898",
  // },
  {
    value: "LB-MISSING_INFO",
    text: "Missing information",
    category: "Listed building consent",
    bgColor: "#DBDBDB",
  },
  // Works to trees
  {
    value: "TR-NOT_REQUIRED",
    text: "Not required",
    category: "Works to trees",
    bgColor: "#FFF",
  },
  {
    value: "TR-DE_MINIMIS",
    text: "De minimis",
    category: "Works to trees",
    bgColor: "#B4BBFF",
  },
  {
    value: "TR-REQUIRED",
    text: "Required",
    category: "Works to trees",
    bgColor: "#FAFF00",
  },
  {
    value: "TR-MISSING_INFO",
    text: "Missing information",
    category: "Works to trees",
    bgColor: "#DBDBDB",
  },
  // Demolition in a conservation area
  {
    value: "DC-NOT_REQUIRED",
    text: "Not required",
    category: "Demolition in a conservation area",
    bgColor: "#FFF",
  },
  {
    value: "DC-DE_MINIMIS",
    text: "De minimis",
    category: "Demolition in a conservation area",
    bgColor: "#FFC2A0",
  },
  {
    value: "DC-REQUIRED",
    text: "Required",
    category: "Demolition in a conservation area",
    bgColor: "#FF5C00",
  },
  {
    value: "DC-MISSING_INFO",
    text: "Missing information",
    category: "Demolition in a conservation area",
    bgColor: "#DBDBDB",
  },
  // Planning policy
  {
    value: "LIKELY_PASS",
    text: "Meets policy",
    category: "Planning policy",
    bgColor: "#63C501",
  },
  {
    value: "EDGE_CASE",
    text: "Edge case",
    category: "Planning policy",
    bgColor: "#FFA800",
  },
  {
    value: "LIKELY_FAIL",
    text: "Fails to meet policy",
    category: "Planning policy",
    bgColor: "#FF001F",
  },
  {
    value: "PO_MISSING_INFO",
    text: "Missing information",
    category: "Planning policy",
    bgColor: "#DBDBDB",
  },
  // Community infrastructure levy
  {
    value: "CO_NOT_LIABLE",
    text: "Not liable",
    category: "Community infrastructure levy",
    bgColor: "#FFF",
  },
  {
    value: "CO_LIABLE",
    text: "Liable",
    category: "Community infrastructure levy",
    bgColor: "#FF0099",
  },
  {
    value: "CO_RELIEF",
    text: "Relief",
    category: "Community infrastructure levy",
    bgColor: "#FFA4DA",
  },
  {
    value: "CO_RELIEF_VOID",
    text: "Relief void",
    category: "Community infrastructure levy",
    bgColor: "#A4698C",
  },
  {
    value: "CO_EXEMPT",
    text: "Exempt",
    category: "Community infrastructure levy",
    bgColor: "#FFDEF2",
  },
  {
    value: "CO_EXEMPTION_VOID",
    text: "Exemption void",
    category: "Community infrastructure levy",
    bgColor: "#CDB1C2",
  },
  {
    value: "CO_MISSING_INFO",
    text: "Missing information",
    category: "Community infrastructure levy",
    bgColor: "#DBDBDB",
  },
].map((f: any) => ({
  ...f,
  color: mostReadable(f.bgColor, ["#000", "#FFF"]),
}));

export default flags;
