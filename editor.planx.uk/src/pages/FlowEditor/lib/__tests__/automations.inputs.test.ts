import { FlowGraph } from "@opensystemslab/planx-core/types";

import { useStore } from "../store";
import { clickContinue } from "./utils";

const { getState, setState } = useStore;
const { resetPreview, upcomingCardIds, autoAnswerableInputs } = getState();

describe("Auto-answering inputs", () => {
  beforeEach(() => {
    resetPreview();
    setState({ flow });
  });

  test("Subsequent date inputs with the same data field auto-answer the second node", () => {
    // Navigate into correct branch
    clickContinue("wsYqF9VQHl", {
      answers: ["6T55RAQACG"],
      auto: false,
    });
    clickContinue("pm9NYtdFfH", { auto: true });
    clickContinue("4nVI3xtPaC", {
      answers: ["4anSeeg3Lc"],
      auto: false,
    });

    // Both date inputs are currently queued up in upcoming card IDs now, as well as the final notice
    expect(upcomingCardIds()).toEqual([
      "9PHIhY2j7Y",
      "5QVNvkoYfj",
      "FVS36zZVbf",
    ]);

    // We cannot auto-answer the first date input (or second) because we've never seen a date input before
    expect(autoAnswerableInputs("9PHIhY2j7Y")).not.toBeDefined();
    expect(autoAnswerableInputs("5QVNvkoYfj")).not.toBeDefined();

    // Manually answer the first date input
    clickContinue("9PHIhY2j7Y", {
      data: { today: "2000-01-01" },
      auto: false,
    });

    // Confirm we can now auto-answer the second date input
    expect(autoAnswerableInputs("5QVNvkoYfj")).toEqual("2000-01-01");
  });

  test("Address inputs on different branches with the same data field auto-answer the second node", () => {
    // Navigate into correct branch
    clickContinue("wsYqF9VQHl", {
      answers: ["QpU3A54qhe"],
      auto: false,
    });
    clickContinue("pm9NYtdFfH", { auto: true });
    clickContinue("OJRUQ8DNSq", {
      answers: ["MHe7DWB3Bc", "JEriTynmg0"],
      auto: false,
    });

    // Both address inputs are currently queued up in upcoming card IDs now
    expect(upcomingCardIds()).toContain("nYlA24C8QD");
    expect(upcomingCardIds()).toContain("4aJG18cEtm");

    // Neither can be auto-answered yet because we've never seen an address input before
    expect(autoAnswerableInputs("nYlA24C8QD")).not.toBeDefined();
    expect(autoAnswerableInputs("4aJG18cEtm")).not.toBeDefined();

    // Manually answer the first address input
    clickContinue("nYlA24C8QD", {
      data: {
        address: {
          line1: "123 Main Street",
          line2: "",
          town: "London",
          county: "",
          postcode: "SE5 0HU",
          country: "England",
        },
      },
      auto: false,
    });

    // Confirm we can now auto-answer the second address input
    expect(autoAnswerableInputs("4aJG18cEtm")).toEqual({
      line1: "123 Main Street",
      line2: "",
      town: "London",
      county: "",
      postcode: "SE5 0HU",
      country: "England",
    });
  });

  test("Text inputs with the same data field auto-answer the second node independent of variant", () => {
    // Navigate into correct branch
    clickContinue("wsYqF9VQHl", {
      answers: ["6T55RAQACG"],
      auto: false,
    });
    clickContinue("pm9NYtdFfH", { auto: true });
    clickContinue("4nVI3xtPaC", {
      answers: ["UKSMGIw1RG"],
      auto: false,
    });
    clickContinue("4bQvIflW6R", { auto: true });

    // Both text inputs are currently queued up in upcoming card IDs now, as well as final notice
    expect(upcomingCardIds()).toEqual([
      "6zqtH8xLH9",
      "KvyDAcvmO4",
      "FVS36zZVbf",
    ]);

    // Neither can be auto-answered because we've never seen a text input before
    expect(autoAnswerableInputs("6zqtH8xLH9")).not.toBeDefined();
    expect(autoAnswerableInputs("KvyDAcvmO4")).not.toBeDefined();

    // Manually answer the first text input (variant = short)
    clickContinue("6zqtH8xLH9", {
      data: { "proposal.description": "Build a garage" },
      auto: false,
    });

    // Confirm we can now auto-answer the second text input (variant = long)
    expect(autoAnswerableInputs("KvyDAcvmO4")).toEqual("Build a garage");
  });

  test("Contact inputs with different data fields do not auto-answer each other", () => {
    // Navigate into correct branch
    clickContinue("wsYqF9VQHl", {
      answers: ["ZRZXfb5rAh"],
      auto: false,
    });
    clickContinue("E2Q1IVRqtZ", { auto: true });

    // Both contact inputs are currently queued up in upcoming card IDs now, as well as final notice
    expect(upcomingCardIds()).toEqual([
      "tRHstVXhAW",
      "08O3PaGYjv",
      "FVS36zZVbf",
    ]);

    // Neither can be auto-answered because we've never seen a contact input before
    expect(autoAnswerableInputs("tRHstVXhAW")).not.toBeDefined();
    expect(autoAnswerableInputs("08O3PaGYjv")).not.toBeDefined();

    // Manually answer the first contact input
    clickContinue("tRHstVXhAW", {
      data: {
        "_contact.applicant.agent": {
          "applicant.agent": {
            title: "",
            firstName: "Jane",
            lastName: "Doe",
            organisation: "OSL",
            phone: "123",
            email: "tester@example.com",
          },
        },
        "applicant.agent.name.first": "Jane",
        "applicant.agent.name.last": "Doe",
        "applicant.agent.company.name": "OSL",
        "applicant.agent.phone.primary": "123",
        "applicant.agent.email": "tester@example.com",
      },
      auto: false,
    });

    // Cofirm we still CANNOT auto-answer the second contact input because it's data field is different (not 'applicant.agent')
    expect(autoAnswerableInputs("08O3PaGYjv")).not.toBeDefined();
  });
});

// https://editor.planx.dev/planx-university/201-automations-with-inputs
const flow: FlowGraph = {
  _root: {
    edges: ["wsYqF9VQHl", "FVS36zZVbf"],
  },
  "08O3PaGYjv": {
    data: {
      fn: "applicant",
      title: "Enter contact details about the applicant",
    },
    type: 135,
  },
  "3trtyDy6D3": {
    data: {
      text: "Different component type, same data field",
    },
    type: 200,
    edges: ["N3R5xvhIBj", "BihSrOeREh", "CoOuK4eU7L"],
  },
  "4aJG18cEtm": {
    data: {
      fn: "address",
      title: "What's your address?",
    },
    type: 130,
  },
  "4anSeeg3Lc": {
    data: {
      text: "DateInput",
    },
    type: 200,
    edges: ["9PHIhY2j7Y", "5QVNvkoYfj"],
  },
  "4bQvIflW6R": {
    data: {
      tags: [],
      text: "Automation is not aware of component variants, only type and data field",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    type: 100,
  },
  "4nVI3xtPaC": {
    data: {
      text: "Which component type?",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    type: 100,
    edges: [
      "ZLHCqaJPjy",
      "Rr6glsOAfC",
      "4anSeeg3Lc",
      "jbU4LLavja",
      "UKSMGIw1RG",
    ],
  },
  "5QVNvkoYfj": {
    data: {
      fn: "today",
      title: "What is today's date?",
    },
    type: 120,
  },
  "6T55RAQACG": {
    data: {
      text: "Same component type, same data field, same branch",
    },
    type: 200,
    edges: ["pm9NYtdFfH", "4nVI3xtPaC"],
  },
  "6zqtH8xLH9": {
    data: {
      fn: "proposal.description",
      type: "short",
      title: "Describe your project (short)",
    },
    type: 110,
  },
  "9PHIhY2j7Y": {
    data: {
      fn: "today",
      title: "What is today's date?",
    },
    type: 120,
  },
  BihSrOeREh: {
    data: {
      fn: "address",
      title: "Where is the project site?",
    },
    type: 130,
  },
  CoOuK4eU7L: {
    data: {
      fn: "address",
      tags: [],
      type: "short",
      title: "What is the single-line address of the project site?",
    },
    type: 110,
  },
  Dgom8rHfbb: {
    data: {
      fn: "kitchen.squareMetres",
      title: "What size is the kitchen?",
      units: "square metres",
      isInteger: false,
      allowNegatives: false,
    },
    type: 150,
  },
  E2Q1IVRqtZ: {
    data: {
      text: "No automation, both data fields captured in passport",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    type: 100,
  },
  EIELS3sQ1B: {
    data: {
      fn: "today.date",
      tags: [],
      title: "What is today's date?",
    },
    type: 120,
  },
  FLp5bfK0Y4: {
    data: {
      fn: "address",
      title: "What's your address?",
    },
    type: 130,
  },
  FVS36zZVbf: {
    data: {
      tags: [],
      color: "#9bb0d4",
      title: "End of test",
      description:
        '<p>Check the "Console" tab in the side panel to inspect which data fields the <code>passport</code>&nbsp;has captured.</p><p></p><p>Curious about doing further automations <em>using</em> the number or text answers captured here? See <strong>[201] Calculator uses </strong>next.</p>',
      resetButton: true,
    },
    type: 8,
  },
  GhRomJidTi: {
    data: {
      text: "Same component type, same parent data field, different granularity - granular first",
    },
    type: 200,
    edges: ["E2Q1IVRqtZ", "tRHstVXhAW", "08O3PaGYjv"],
  },
  JEriTynmg0: {
    data: {
      text: "B",
    },
    type: 200,
    edges: [
      "4aJG18cEtm",
      "Ng9xDIuYyK",
      "n9xhiw2CoX",
      "Dgom8rHfbb",
      "NLaLOJkPf8",
    ],
  },
  KOEuWX5Sk8: {
    data: {
      fn: "kitchen.squareMetres",
      title: "What size is the kitchen?",
      units: "square metres",
      isInteger: false,
      allowNegatives: false,
    },
    type: 150,
  },
  KvyDAcvmO4: {
    data: {
      fn: "proposal.description",
      type: "long",
      title: "Describe your project (long)",
    },
    type: 110,
  },
  M3d6MDuNqQ: {
    data: {
      fn: "contact",
      title: "Enter your contact info",
    },
    type: 135,
  },
  MHe7DWB3Bc: {
    data: {
      text: "A",
    },
    type: 200,
    edges: [
      "nYlA24C8QD",
      "M3d6MDuNqQ",
      "im1Sx9S9PL",
      "ocli1KqDVs",
      "kDUkzhO5Tq",
    ],
  },
  N3R5xvhIBj: {
    data: {
      text: "No automation, second component type overwrites first in passport",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    type: 100,
  },
  NLaLOJkPf8: {
    data: {
      fn: "proposal.description",
      type: "short",
      title: "Describe your project (short)",
    },
    type: 110,
  },
  Ng9xDIuYyK: {
    data: {
      fn: "contact",
      title: "Enter your contact info",
    },
    type: 135,
  },
  OJRUQ8DNSq: {
    data: {
      text: "Which path?",
      allRequired: false,
      description: "<p>Select both, but only expect to see each node once</p>",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    type: 105,
    edges: ["MHe7DWB3Bc", "JEriTynmg0"],
  },
  QpU3A54qhe: {
    data: {
      text: "Same component type, same data field, different branches",
    },
    type: 200,
    edges: ["pm9NYtdFfH", "OJRUQ8DNSq"],
  },
  Rr6glsOAfC: {
    data: {
      text: "ContactInput",
    },
    type: 200,
    edges: ["doIuif2SPm", "c3Fbf2UC6V"],
  },
  UKSMGIw1RG: {
    data: {
      text: "TextInput",
    },
    type: 200,
    edges: ["4bQvIflW6R", "6zqtH8xLH9", "KvyDAcvmO4"],
  },
  ZLHCqaJPjy: {
    data: {
      text: "AddressInput",
    },
    type: 200,
    edges: ["qkTJgAxmKS", "FLp5bfK0Y4"],
  },
  ZRZXfb5rAh: {
    data: {
      text: "Same component type, same parent data field, different granularity - parent first",
    },
    type: 200,
    edges: ["E2Q1IVRqtZ", "08O3PaGYjv", "tRHstVXhAW"],
  },
  c3Fbf2UC6V: {
    data: {
      fn: "contact",
      title: "Enter your contact info",
    },
    type: 135,
  },
  cUDoDEnYqJ: {
    data: {
      fn: "start",
      title: "When will the proposed project work start?",
    },
    type: 120,
  },
  doIuif2SPm: {
    data: {
      fn: "contact",
      title: "Enter your contact info",
    },
    type: 135,
  },
  im1Sx9S9PL: {
    data: {
      fn: "today",
      title: "What is today's date?",
    },
    type: 120,
  },
  jbU4LLavja: {
    data: {
      text: "NumberInput",
    },
    type: 200,
    edges: ["KOEuWX5Sk8", "rpezMeUdQI"],
  },
  kDUkzhO5Tq: {
    data: {
      fn: "proposal.description",
      type: "short",
      title: "Describe your project (short)",
    },
    type: 110,
  },
  n9xhiw2CoX: {
    data: {
      fn: "today",
      title: "What is today's date?",
    },
    type: 120,
  },
  nYlA24C8QD: {
    data: {
      fn: "address",
      title: "What's your address?",
    },
    type: 130,
  },
  oRF8N9ZNqy: {
    data: {
      fn: "end",
      title: "When will the project be completed by?",
    },
    type: 120,
  },
  ocli1KqDVs: {
    data: {
      fn: "kitchen.squareMetres",
      title: "What size is the kitchen?",
      units: "square metres",
      isInteger: false,
      allowNegatives: false,
    },
    type: 150,
  },
  pm9NYtdFfH: {
    data: {
      text: "Auto-answers",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    type: 100,
  },
  qkTJgAxmKS: {
    data: {
      fn: "address",
      title: "What's your address?",
    },
    type: 130,
  },
  rpezMeUdQI: {
    data: {
      fn: "kitchen.squareMetres",
      title: "How big is the kitchen?",
      units: "square metres",
      isInteger: false,
      allowNegatives: false,
    },
    type: 150,
  },
  tRHstVXhAW: {
    data: {
      fn: "applicant.agent",
      title: "Enter contact details about the agent",
    },
    type: 135,
  },
  u1cb91eCTu: {
    data: {
      text: "Same component type, different data field",
    },
    type: 200,
    edges: ["E2Q1IVRqtZ", "cUDoDEnYqJ", "oRF8N9ZNqy"],
  },
  v9W032zedH: {
    data: {
      fn: "today.day",
      type: "short",
      title: "Which day of the week is it?",
    },
    type: 110,
  },
  vJrXTecNrX: {
    data: {
      text: "Different component type, different data field",
    },
    type: 200,
    edges: ["E2Q1IVRqtZ", "EIELS3sQ1B", "v9W032zedH"],
  },
  wsYqF9VQHl: {
    data: {
      tags: [],
      text: "Which scenario?",
      neverAutoAnswer: false,
      alwaysAutoAnswerBlank: false,
    },
    type: 100,
    edges: [
      "6T55RAQACG",
      "QpU3A54qhe",
      "u1cb91eCTu",
      "GhRomJidTi",
      "ZRZXfb5rAh",
      "3trtyDy6D3",
      "vJrXTecNrX",
    ],
  },
};
