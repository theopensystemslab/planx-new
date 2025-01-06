import { Store, useStore } from "../store";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

const { getState, setState } = useStore;
const { getFlowSchema } = getState();

describe("generating the schema for a flow", () => {
  test("a unique ordered set of all component type data fields (fn) are returned as schema.nodes", () => {
    setState({ flow });
    expect(getFlowSchema()?.nodes).toEqual([
      "property.type",
      "proposal.projectType",
      "proposal.startDate",
    ]);
  });

  test("a unique ordered set of all answer type data values (val) are returned as schema.options", () => {
    setState({ flow });
    expect(getFlowSchema()?.options).toEqual([
      "alter",
      "changeOfUse",
      "demolish",
      "extend",
      "internal",
      "new",
      "other",
      "residential",
      "residential.HMO",
      "residential.dwelling.flat",
      "residential.dwelling.house",
      "unit",
    ]);
  });

  test("filters and their flag values are omitted from the schema", () => {
    setState({ flow: flowWithFilter });
    expect(getFlowSchema()).toEqual({ nodes: [], options: [] });
  });

  test("an empty flow returns an empty schema", () => {
    setState({ flow: {} });
    expect(getFlowSchema()).toEqual({ nodes: [], options: [] });
  });
});

const flow: Store.Flow = {
  "_root": {
    "edges": [
      "PropertyQuestion",
      "ProjectQuestion",
      "DateInput"
    ]
  },
  "0mUjzeoySp": {
    "data": {
      "val": "residential.dwelling.flat",
      "text": "Flat"
    },
    "type": TYPES.Answer
  },
  "ProjectQuestion": {
    "data": {
      "fn": "proposal.projectType",
      "text": "Do you have any supported project?"
    },
    "type": TYPES.Question,
    "edges": [
      "TtjHD8V5Z9",
      "FPHuxFvNmb",
      "lOtvc52uBR",
      "ZI4h6FLszP",
      "X1YhLhqImI",
      "hWyONP37gE",
      "7TBRnmE54E",
      "NWR7GMCibW"
    ]
  },
  "7TBRnmE54E": {
    "data": {
      "val": "unit",
      "text": "Unit conversion"
    },
    "type": TYPES.Answer
  },
  "GranularPropertyQuestion": {
    "data": {
      "fn": "property.type",
      "text": "What type of property is it?"
    },
    "type": TYPES.Question,
    "edges": [
      "vNV3AeoySp",
      "0mUjzeoySp",
      "r3dAheoySp"
    ]
  },
  "FPHuxFvNmb": {
    "data": {
      "val": "alter",
      "text": "Alteration"
    },
    "type": TYPES.Answer
  },
  "NWR7GMCibW": {
    "data": {
      "val": "other",
      "text": "No"
    },
    "type": TYPES.Answer
  },
  "PropertyQuestion": {
    "data": {
      "fn": "property.type",
      "text": "What type of property is it?",
      "neverAutoAnswer": false,
      "tags": []
    },
    "type": TYPES.Question,
    "edges": [
      "n14BneoySp",
      "ZptuQeoySp"
    ]
  },
  "TtjHD8V5Z9": {
    "data": {
      "val": "extend",
      "text": "Extension"
    },
    "type": TYPES.Answer
  },
  "X1YhLhqImI": {
    "data": {
      "val": "new",
      "text": "New build"
    },
    "type": TYPES.Answer
  },
  "ZI4h6FLszP": {
    "data": {
      "val": "changeOfUse",
      "text": "Change of Use"
    },
    "type": TYPES.Answer
  },
  "ZptuQeoySp": {
    "data": {
      "text": "Something else",
      "val": "other"
    },
    "type": TYPES.Answer
  },
  "hWyONP37gE": {
    "data": {
      "val": "demolish",
      "text": "Demolition"
    },
    "type": TYPES.Answer
  },
  "lOtvc52uBR": {
    "data": {
      "val": "internal",
      "text": "Internal"
    },
    "type": TYPES.Answer
  },
  "n14BneoySp": {
    "data": {
      "val": "residential",
      "text": "Residential"
    },
    "type": TYPES.Answer,
    "edges": [
      "GranularPropertyQuestion"
    ]
  },
  "r3dAheoySp": {
    "data": {
      "val": "residential.HMO",
      "text": "HMO"
    },
    "type": TYPES.Answer
  },
  "vNV3AeoySp": {
    "data": {
      "val": "residential.dwelling.house",
      "text": "House"
    },
    "type": TYPES.Answer
  },
  "DateInput": {
    "type": TYPES.DateInput,
    "data": {
      "title": "When will the works begin?",
      "fn": "proposal.startDate",
      "min": "2024-01-01",
      "max": "2050-01-01"
    }
  }
};

const flowWithFilter: Store.Flow = {
  "_root": {
    "edges": [
      "Filter"
    ]
  },
  "96L5yOhBQJ": {
    "data": {
      "val": "TR-DE_MINIMIS",
      "text": "De minimis"
    },
    "type": TYPES.Answer
  },
  "G404TmcPne": {
    "data": {
      "val": "TR-MISSING_INFO",
      "text": "Missing information"
    },
    "type": TYPES.Answer
  },
  "Filter": {
    "data": {
      "fn": "flag",
      "category": "Works to trees & hedges"
    },
    "type": TYPES.Filter,
    "edges": [
      "G404TmcPne",
      "UXbWvxQMPF",
      "96L5yOhBQJ",
      "W3ovRimuF3",
      "xkiC61BIiG"
    ]
  },
  "UXbWvxQMPF": {
    "data": {
      "val": "TR-REQUIRED",
      "text": "Required"
    },
    "type": TYPES.Answer
  },
  "W3ovRimuF3": {
    "data": {
      "val": "TR-NOT_REQUIRED",
      "text": "Not required"
    },
    "type": TYPES.Answer
  },
  "xkiC61BIiG": {
    "data": {
      "text": "No flag result"
    },
    "type": TYPES.Answer
  }
};
