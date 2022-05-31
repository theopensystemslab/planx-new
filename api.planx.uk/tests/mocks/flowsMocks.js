const flowWithoutReview = {
  _root: {
    edges: ["IHTyNVZqon", "EO6DzPso8o", "UMv3vxa3kJ"],
  },
  EO6DzPso8o: {
    data: {
      dataFieldBoundary: "property.boundary.site",
    },
    type: 10,
  },
  IHTyNVZqon: {
    data: {
      description: "<p>For example CM7 3YL</p>",
    },
    type: 9,
  },
  UMv3vxa3kJ: {
    data: {
      fn: "property.constraints.planning",
      title: "Planning constraints",
      description: "<p>Things that might affect your project</p>\n",
    },
    type: 11,
  },
};

const flowWithReview = {
  _root: {
    edges: ["LWrGuRbxaP", "rESmUpGwOo"],
  },
  LWrGuRbxaP: {
    data: {
      title: "Test text",
    },
    type: 110,
  },
  rESmUpGwOo: {
    data: {
      title: "Check your answers before sending your application",
    },
    type: 600,
  },
};

const searchFlow = {
  _root: {
    edges: ["postcode", "drawBoundary", "planningConstraints"],
  },
  drawBoundary: {
    data: {
      dataFieldBoundary: "property.boundary.site",
    },
    type: 10,
  },
  postcode: {
    data: {
      description: "<p>For example CM7 3YL</p>",
    },
    type: 9,
  },
  planningConstraints: {
    data: {
      fn: "property.constraints.planning",
      title: "Planning constraints",
      description: "<p>Things that might affect your project</p>\n",
    },
    type: 11,
  },
};

const FLOW_WITH_REVIEW_ID = "180f59d1-6a71-4028-a16e-81e503b384fc";
const FLOW_WITHOUT_REVIEW_ID = "200f59d1-6a71-4028-a16e-81e503b384cd";
const SEARCH_FLOW_ID = "200f59d1-6a71-4028-a16e-81e503b384ca";

module.exports = {  
  flowWithoutReview,
  flowWithReview,
  searchFlow,
  FLOW_WITH_REVIEW_ID,
  FLOW_WITHOUT_REVIEW_ID,
  SEARCH_FLOW_ID,
}
