export const flowWithEmptySections = {
  _root: {
    edges: [
      "w74b4ik7z1",
      "DdbCFDRZH0",
      "7FncYdK9d8",
      "TF5I8NHpk1",
      "mQeG6jHNoQ",
      "pVnEmZvHNa",
    ],
  },
  "3FJ2Du4RpG": {
    data: {
      text: "a",
    },
    type: 200,
  },
  "7FncYdK9d8": {
    data: {
      title: "This is an empty section",
    },
    type: 360,
  },
  DdbCFDRZH0: {
    data: {
      text: "Question 1",
    },
    type: 100,
    edges: ["3FJ2Du4RpG", "rSNMzMODm3"],
  },
  TF5I8NHpk1: {
    data: {
      title: "This is a section without presentational components",
    },
    type: 360,
  },
  mQeG6jHNoQ: {
    data: {
      title: "Check your answers before sending your application",
    },
    type: 600,
  },
  pVnEmZvHNa: {
    data: {
      heading: "Application sent",
      moreInfo:
        "<h2>You will be contacted</h2>\n        <ul>\n        <li>if there is anything missing from the information you have provided so far</li>\n        <li>if any additional information is required</li>\n        <li>to arrange a site visit, if required</li>\n        <li>to inform you whether a certificate has been granted or not</li>\n        </ul>",
      contactInfo:
        "You can contact us at <em>planning@lambeth.gov.uk</em>\n          <br/><br/>\n          What did you think of this service? Please give us your feedback using the link in the footer below.",
      description:
        "A payment receipt has been emailed to you. You will also receive an email to confirm when your application has been received.",
    },
    type: 725,
  },
  rSNMzMODm3: {
    data: {
      text: "b",
    },
    type: 200,
  },
  w74b4ik7z1: {
    data: {
      title: "This is a real section",
    },
    type: 360,
  },
};

export const breadcrumbsWithEmptySections = {
  w74b4ik7z1: {
    auto: false,
  },
  DdbCFDRZH0: {
    auto: false,
    answers: ["3FJ2Du4RpG"],
  },
  "7FncYdK9d8": {
    auto: false,
  },
  TF5I8NHpk1: {
    auto: false,
  },
};

export const passportWithEmptySections = {
  data: {},
};
