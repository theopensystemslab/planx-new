import { ComponentType } from "@opensystemslab/planx-core/types";

import { useStore } from "../../store";

const { getState, setState } = useStore;
const { autoAnswerableInputs } = getState();

describe("Returns undefined and does not auto-answer unsupported inputs", () => {
  test("If the node is not a supported Input type", () => {
    setState({
      flow: {
        _root: { edges: ["SetValue"] },
        SetValue: {
          type: ComponentType.SetValue,
          data: { fn: "projectType", val: "alter", operation: "replace" },
        },
      },
      breadcrumbs: {},
    });

    expect(autoAnswerableInputs("SetValue")).not.toBeDefined();
  });

  test("If the node does not set a `fn`", () => {
    setState({
      flow: {
        _root: { edges: ["TextInputA"] },
        TextInputA: {
          type: ComponentType.TextInput,
          data: { title: "Enter your first name", type: "short" },
        },
      },
      breadcrumbs: {},
    });

    expect(autoAnswerableInputs("TextInputA")).not.toBeDefined();
  });

  test("If we've never seen another node with this `fn` before", () => {
    setState({
      flow: {
        _root: { edges: ["TextInputA", "TextInputB"] },
        TextInputA: {
          type: ComponentType.TextInput,
          data: {
            fn: "name.first",
            title: "Enter your first name",
            type: "short",
          },
        },
        TextInputB: {
          type: ComponentType.TextInput,
          data: {
            fn: "name.last",
            title: "Enter your last name",
            type: "short",
          },
        },
      },
      breadcrumbs: {
        TextInputA: { auto: false, data: { "name.first": "Tester" } },
      },
    });

    expect(autoAnswerableInputs("TextInputB")).not.toBeDefined();
  });

  test("If we've never seen a node of this same type with this `fn` before", () => {
    setState({
      flow: {
        _root: { edges: ["TextInputA", "NumberInputA"] },
        TextInputA: {
          type: ComponentType.TextInput,
          data: { fn: "name", title: "Enter your name", type: "short" },
        },
        NumberInputA: {
          type: ComponentType.NumberInput,
          data: { fn: "name", title: "Enter your name", units: "letters" },
        },
      },
      breadcrumbs: {
        TextInputA: { auto: false, data: { name: "T3st3r" } },
      },
    });

    expect(autoAnswerableInputs("NumberInputA")).not.toBeDefined();
  });
});

describe("AddressInputs", () => {
  test("Outputs the expected breadcrumb format for an auto-answerable node", () => {
    setState({
      flow: {
        _root: { edges: ["AddressInputA", "AddressInputB"] },
        AddressInputA: {
          type: ComponentType.AddressInput,
          data: {
            fn: "address",
            title: "Enter your address",
          },
        },
        AddressInputB: {
          type: ComponentType.AddressInput,
          data: {
            fn: "address",
            title: "Enter your address",
          },
        },
      },
      breadcrumbs: {
        AddressInputA: {
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
        },
      },
    });

    expect(autoAnswerableInputs("AddressInputB")).toEqual({
      line1: "123 Main Street",
      line2: "",
      town: "London",
      county: "",
      postcode: "SE5 0HU",
      country: "England",
    });
  });
});

describe("ContactInputs", () => {
  test("Outputs the expected breadcrumb format for an auto-answerable node", () => {
    setState({
      flow: {
        _root: { edges: ["ContactInputA", "ContactInputB"] },
        ContactInputA: {
          type: ComponentType.ContactInput,
          data: {
            fn: "applicant.agent",
            title: "Enter your contact details",
          },
        },
        ContactInputB: {
          type: ComponentType.ContactInput,
          data: {
            fn: "applicant.agent",
            title: "Enter your contact details",
          },
        },
      },
      breadcrumbs: {
        ContactInputA: {
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
        },
      },
    });

    expect(autoAnswerableInputs("ContactInputB")).toEqual({
      title: "",
      firstName: "Jane",
      lastName: "Doe",
      organisation: "OSL",
      phone: "123",
      email: "tester@example.com",
    });
  });
});

describe("DateInput", () => {
  test("Outputs the expected breadcrumb format for an auto-answerable node", () => {
    setState({
      flow: {
        _root: { edges: ["DateInputA", "DateInputB"] },
        DateInputA: {
          type: ComponentType.DateInput,
          data: {
            fn: "today",
            title: "Enter the date",
          },
        },
        DateInputB: {
          type: ComponentType.DateInput,
          data: {
            fn: "today",
            title: "Enter the date",
          },
        },
      },
      breadcrumbs: {
        DateInputA: {
          data: { today: "2025-10-06" },
          auto: false,
        },
      },
    });

    expect(autoAnswerableInputs("DateInputB")).toEqual("2025-10-06");
  });
});

describe("NumberInput", () => {
  test("Outputs the expected breadcrumb format for an auto-answerable node", () => {
    setState({
      flow: {
        _root: { edges: ["NumberInputA", "NumberInputB"] },
        NumberInputA: {
          type: ComponentType.NumberInput,
          data: {
            fn: "marbles",
            title: "How many marbles are in the jar?",
          },
        },
        NumberInputB: {
          type: ComponentType.NumberInput,
          data: {
            fn: "marbles",
            title: "Guess again",
          },
        },
      },
      breadcrumbs: {
        NumberInputA: {
          data: { marbles: 666 },
          auto: false,
        },
      },
    });

    expect(autoAnswerableInputs("NumberInputB")).toEqual(666);
  });
});

describe("TextInput", () => {
  test("Outputs the expected breadcrumb format for an auto-answerable node", () => {
    setState({
      flow: {
        _root: { edges: ["TextInputA", "TextInputB"] },
        TextInputA: {
          type: ComponentType.TextInput,
          data: {
            fn: "name",
            title: "Enter your name",
            type: "short",
          },
        },
        TextInputB: {
          type: ComponentType.TextInput,
          data: {
            fn: "name",
            title: "Enter your name",
            type: "long",
          },
        },
      },
      breadcrumbs: {
        TextInputA: {
          data: { name: "Tester" },
          auto: false,
        },
      },
    });

    expect(autoAnswerableInputs("TextInputB")).toEqual("Tester");
  });
});
