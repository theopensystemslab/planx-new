import { ComponentType } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";

import { mockChecklistOptionResult, mockChecklistResult, mockFileUploadAndLabelResult, mockFlow, mockNextStepsOptionResult, mockNumberInputResult, mockPayResult, mockQuestionResult, mockSchemaResult, mockTaskListResult } from "../mocks/allFacetFlow";
import { getDisplayDetailsForResult } from "./getDisplayDetailsForResult";

type Output = ReturnType<typeof getDisplayDetailsForResult>;

// Setup flow so that it can be referenced by SearchResults (e.g. getting parent nodes)
beforeAll(() => useStore.setState({ flow: mockFlow }));

describe("Basic fields", () => {
  it("renders data.text", () => {
    const output = getDisplayDetailsForResult(mockQuestionResult);

    expect(output).toStrictEqual<Output>({
      key: "Title",
      iconKey: ComponentType.Question,
      componentType: "Question",
      title: "Seahorse",
      headline: "Seahorse",
    });
  });

  it("renders data.description", () => {
    const output = getDisplayDetailsForResult({
      ...mockQuestionResult,
      key: "data.description",
    });

    expect(output).toStrictEqual<Output>({
      key: "Description",
      iconKey: ComponentType.Question,
      componentType: "Question",
      title: "Seahorse",
      headline: "<p>Peacock</p>",
    });
  });

  it("renders data.title", () => {
    const output = getDisplayDetailsForResult(mockPayResult);

    expect(output).toStrictEqual<Output>({
      key: "Title",
      iconKey: ComponentType.Pay,
      componentType: "Pay",
      title: "Jaguar",
      headline: "Jaguar",
    });
  });
});

describe("More information fields", () => {
  it("renders data.notes", () => {
    const output = getDisplayDetailsForResult({
      ...mockQuestionResult,
      key: "data.notes",
    });

    expect(output).toStrictEqual<Output>({
      key: "Internal notes",
      iconKey: ComponentType.Question,
      componentType: "Question",
      title: "Seahorse",
      headline: "Echidna",
    });
  });

  it("renders data.howMeasured", () => {
    const output = getDisplayDetailsForResult({
      ...mockQuestionResult,
      key: "data.howMeasured",
    });

    expect(output).toStrictEqual<Output>({
      key: "How is it defined",
      iconKey: ComponentType.Question,
      componentType: "Question",
      title: "Seahorse",
      headline: "<p>Gazelle</p>",
    });
  });

  it("renders data.policyRef", () => {
    const output = getDisplayDetailsForResult({
      ...mockQuestionResult,
      key: "data.policyRef",
    });

    expect(output).toStrictEqual<Output>({
      key: "Policy reference",
      iconKey: ComponentType.Question,
      componentType: "Question",
      title: "Seahorse",
      headline: "<p>Rat</p>",
    });
  });

  it("renders data.info", () => {
    const output = getDisplayDetailsForResult({
      ...mockQuestionResult,
      key: "data.info",
    });

    expect(output).toStrictEqual<Output>({
      key: "Why it matters",
      iconKey: ComponentType.Question,
      componentType: "Question",
      title: "Seahorse",
      headline: "<p>Octopus</p>",
    });
  });
});

describe("checklist fields", () => {
  it("renders data.categories.title", () => {
    const output = getDisplayDetailsForResult(mockChecklistResult);

    expect(output).toStrictEqual<Output>({
      key: "Title",
      iconKey: ComponentType.Checklist,
      componentType: "Checklist",
      title: ".",
      headline: "Koala",
    });
  });

  it("renders data.text", () => {
    const output = getDisplayDetailsForResult(mockChecklistOptionResult);

    expect(output).toStrictEqual<Output>({
      key: "Option (title)",
      iconKey: ComponentType.Checklist,
      componentType: "Checklist",
      title: ".",
      headline: "Duck",
    });
  });
});
describe("nextSteps fields", () => {
  it("renders data.steps.title", () => {
    const output = getDisplayDetailsForResult(mockNextStepsOptionResult);

    expect(output).toStrictEqual<Output>({
      key: "Title (step)",
      iconKey: ComponentType.NextSteps,
      componentType: "Next steps",
      title: ".",
      headline: "Hamster",
    });
  });

  it("renders data.steps.description", () => {
    const output = getDisplayDetailsForResult({
      ...mockNextStepsOptionResult,
      key: "data.steps.description",
    });

    expect(output).toStrictEqual<Output>({
      key: "Description (step)",
      iconKey: ComponentType.NextSteps,
      componentType: "Next steps",
      title: ".",
      headline: "Vulture",
    });
  });

  it("renders data.steps.url", () => {
    const output = getDisplayDetailsForResult({
      ...mockNextStepsOptionResult,
      key: "data.steps.url",
    });

    expect(output).toStrictEqual<Output>({
      key: "URL (step)",
      iconKey: ComponentType.NextSteps,
      componentType: "Next steps",
      title: ".",
      headline: "https://www.starfish.gov.uk",
    });
  });
});

describe("fileUploadAndLabel fields", () => {
  it("renders data.fileTypes.name", () => {
    const output = getDisplayDetailsForResult(mockFileUploadAndLabelResult);

    expect(output).toStrictEqual<Output>({
      key: "Name (file type)",
      iconKey: ComponentType.FileUploadAndLabel,
      componentType: "File upload and label",
      title: ".",
      headline: "Penguin",
    });
  });

  it("renders data.fileTypes.moreInformation.info", () => {
     const output = getDisplayDetailsForResult({
       ...mockFileUploadAndLabelResult,
       key: "data.fileTypes.moreInformation.info",
     });

     expect(output).toStrictEqual<Output>({
       key: "Why it matters (file type)",
       iconKey: ComponentType.FileUploadAndLabel,
       componentType: "File upload and label",
       title: ".",
       headline: "<p>Kangaroo</p>",
     });
  });
  
  it("renders data.fileTypes.moreInformation.policyRef", () => {
    const output = getDisplayDetailsForResult({
      ...mockFileUploadAndLabelResult,
      key: "data.fileTypes.moreInformation.policyRef",
    });

    expect(output).toStrictEqual<Output>({
      key: "Policy reference (file type)",
      iconKey: ComponentType.FileUploadAndLabel,
      componentType: "File upload and label",
      title: ".",
      headline: "<p>Tiger</p>",
    });
  });

  it("renders data.fileTypes.moreInformation.howMeasured", () => {
    const output = getDisplayDetailsForResult({
      ...mockFileUploadAndLabelResult,
      key: "data.fileTypes.moreInformation.howMeasured",
    });

    expect(output).toStrictEqual<Output>({
      key: "How is it defined (file type)",
      iconKey: ComponentType.FileUploadAndLabel,
      componentType: "File upload and label",
      title: ".",
      headline: "<p>Salamander</p>",
    });
  });
});

describe("numberInput fields", () => {
  it("renders data.units", () => {
    const output = getDisplayDetailsForResult(mockNumberInputResult);

    expect(output).toStrictEqual<Output>({
      key: "Unit type",
      iconKey: ComponentType.NumberInput,
      componentType: "Number input",
      title: "",
      headline: "Wolverine",
    });
  });
});

describe("schemaComponents fields", () => {
  it("renders data.schemaName", () => {
    const output = getDisplayDetailsForResult(mockSchemaResult);

    expect(output).toStrictEqual<Output>({
      key: "Schema name",
      iconKey: ComponentType.List,
      componentType: "List",
      title: ".",
      headline: "Hedgehog",
    });
  });

  it("renders data.schema.fields.data.title", () => {
    const output = getDisplayDetailsForResult({
      ...mockSchemaResult,
      key: "data.schema.fields.data.title"
    });

    expect(output).toStrictEqual<Output>({
      key: "Title",
      iconKey: ComponentType.List,
      componentType: "List",
      title: ".",
      headline: "Donkey",
    });
  });

  it("renders data.schema.fields.data.description", () => {
      const output = getDisplayDetailsForResult({
        ...mockSchemaResult,
        key: "data.schema.fields.data.description",
      });

      expect(output).toStrictEqual<Output>({
        key: "Description",
        iconKey: ComponentType.List,
        componentType: "List",
        title: ".",
        headline: "Alpaca",
      });
  });

  it("renders data.schema.fields.data.options.data.text", () => {
    const output = getDisplayDetailsForResult({
      ...mockSchemaResult,
      key: "data.schema.fields.data.options.text",
    });

    expect(output).toStrictEqual<Output>({
      key: "Option",
      iconKey: ComponentType.List,
      componentType: "List",
      title: ".",
      headline: "Iguana",
    });
  });

  it("renders data.schema.fields.data.options.data.description", () => {
    const output = getDisplayDetailsForResult({
      ...mockSchemaResult,
      key: "data.schema.fields.data.options.data.description",
    });

    expect(output).toStrictEqual<Output>({
      key: "Option (description)",
      iconKey: ComponentType.List,
      componentType: "List",
      title: ".",
      headline: "Parrot",
    });
  });
});

describe("taskList fields", () => {
  it("renders data.tasks.title", () => {
    const output = getDisplayDetailsForResult(mockTaskListResult);

    expect(output).toStrictEqual<Output>({
      key: "Title (task)",
      iconKey: ComponentType.TaskList,
      componentType: "Task list",
      title: ".",
      headline: "Ostrich",
    });
  });

  it("renders data.tasks.description", () => {
    const output = getDisplayDetailsForResult({
      ...mockTaskListResult,
      key: "data.tasks.description",
    });

    expect(output).toStrictEqual<Output>({
      key: "Description (task)",
      iconKey: ComponentType.TaskList,
      componentType: "Task list",
      title: ".",
      headline: "<p>Beaver</p>",
    });
  });
});

// TODO: Flag tests
// const result: SearchFacets = [
//   ...flatFlags.flatMap(({ value }) => [
//     `data.overrides.${value}.heading`,
//     `data.overrides.${value}.description`,
//   ]),
// ];

describe("content fields", () => {
  it.todo("renders data.content");
});

describe("confirmation fields", () => {
  it.todo("renders data.heading");
  it.todo("renders data.moreInfo");
  it.todo("renders data.contactInfo");
  it.todo("renders data.nextSteps.title");
  it.todo("renders data.nextSteps.description");
});

describe("findProperty fields", () => {
  it.todo("renders data.newAddressTitle");
  it.todo("renders data.newAddressDescription");
  it.todo("renders data.newAddressDescriptionLabel");
});

describe("drawBoundary fields", () => {
  it.todo("renders data.titleForUploading");
  it.todo("renders data.descriptionForUploading");
});

describe("planningConstraints fields", () => {
  it.todo("renders data.disclaimer");
});

describe("pay fields", () => {
  it.todo("renders data.bannerTitle");
  it.todo("renders data.instructionsTitle");
  it.todo("renders data.instructionsDescription");
  it.todo("renders data.secondaryPageTitle");
  it.todo("renders data.nomineeTitle");
  it.todo("renders data.nomineeDescription");
  it.todo("renders data.yourDetailsTitle");
  it.todo("renders data.yourDetailsDescription");
  it.todo("renders data.yourDetailsLabel");
});
