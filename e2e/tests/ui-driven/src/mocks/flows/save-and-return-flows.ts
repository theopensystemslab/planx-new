export const simpleSendFlow = {
  _root: {
    edges: ["VrA1Jrqtf2", "mhsohJY1EE", "plQLwrR898", "gL2QJ5HFbw"],
  },
  VrA1Jrqtf2: {
    data: {
      fn: "answer",
      text: "Question 1",
    },
    type: 100,
    edges: ["hblS8XRf5z", "fhLnbq9mIZ", "s57pJoq7RD"],
  },

  hblS8XRf5z: {
    data: {
      val: "a",
      text: "A",
    },
    type: 200,
  },
  fhLnbq9mIZ: {
    data: {
      val: "b",
      text: "B",
    },
    type: 200,
  },
  s57pJoq7RD: {
    data: {
      val: "c",
      text: "C",
    },
    type: 200,
  },

  mhsohJY1EE: {
    data: {
      text: "Question 2",
    },
    type: 100,
    edges: ["YoQYqeaDeK", "xFHtpoX8NI", "zKW1X9QpAp"],
  },
  YoQYqeaDeK: {
    data: {
      val: "one",
      text: "One",
    },
    type: 200,
  },
  xFHtpoX8NI: {
    data: {
      val: "two",
      text: "Two",
    },
    type: 200,
  },
  zKW1X9QpAp: {
    data: {
      val: "three",
      text: "Three",
    },
    type: 200,
  },
  plQLwrR898: {
    data: {
      title: "Check your answers before sending your application",
    },
    type: 600,
  },
  gL2QJ5HFbw: {
    data: {
      title: "Send",
      destinations: ["bops"],
    },
    type: 650,
  },
};

export const modifiedSimpleSendFlow = {
  ...simpleSendFlow,
  VrA1Jrqtf2: {
    data: {
      fn: "answer",
      text: "Question One",
    },
    type: 100,
    edges: ["hblS8XRf5z", "fhLnbq9mIZ", "s57pJoq7RD"],
  },
};
