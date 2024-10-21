import { ComponentType } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";

import {
  mockChecklistOptionResult,
  mockChecklistResult,
  mockConfirmationResult,
  mockContentResult,
  mockDrawBoundaryResult,
  mockFileUploadAndLabelResult,
  mockFindPropertyResult,
  mockFlow,
  mockNextStepsOptionResult,
  mockNumberInputResult,
  mockPayResult,
  mockPlanningConstraintsResult,
  mockQuestionResult,
  mockResultResult,
  mockSchemaResult,
  mockTaskListResult,
} from "../mocks/allFacetFlow";
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
      key: "data.schema.fields.data.title",
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

describe("content fields", () => {
  it("renders data.content", () => {
    const output = getDisplayDetailsForResult(mockContentResult);

    expect(output).toStrictEqual<Output>({
      key: "Content",
      iconKey: ComponentType.Content,
      componentType: "Content",
      title: "",
      headline: "<p>Sheep</p>",
    });
  });
});

describe("confirmation fields", () => {
  it("renders data.heading", () => {
    const output = getDisplayDetailsForResult(mockConfirmationResult);

    expect(output).toStrictEqual<Output>({
      key: "Title",
      iconKey: ComponentType.Confirmation,
      componentType: "Confirmation",
      title: "",
      headline: "Snake",
    });
  });

  it("renders data.moreInfo", () => {
    const output = getDisplayDetailsForResult({
      ...mockConfirmationResult,
      key: "data.moreInfo",
    });

    expect(output).toStrictEqual<Output>({
      key: "More information",
      iconKey: ComponentType.Confirmation,
      componentType: "Confirmation",
      title: "",
      headline: "<p>Tarantula</p>",
    });
  });

  it("renders data.contactInfo", () => {
    const output = getDisplayDetailsForResult({
      ...mockConfirmationResult,
      key: "data.contactInfo",
    });

    expect(output).toStrictEqual<Output>({
      key: "Contact information",
      iconKey: ComponentType.Confirmation,
      componentType: "Confirmation",
      title: "",
      headline: "<p>Weasel</p>",
    });
  });

  it("renders data.nextSteps.title", () => {
    const output = getDisplayDetailsForResult({
      ...mockConfirmationResult,
      key: "data.nextSteps.title",
    });

    expect(output).toStrictEqual<Output>({
      key: "Title (next steps)",
      iconKey: ComponentType.Confirmation,
      componentType: "Confirmation",
      title: "",
      headline: "Llama",
    });
  });

  it("renders data.nextSteps.description", () => {
    const output = getDisplayDetailsForResult({
      ...mockConfirmationResult,
      key: "data.nextSteps.description",
    });

    expect(output).toStrictEqual<Output>({
      key: "Description (next steps)",
      iconKey: ComponentType.Confirmation,
      componentType: "Confirmation",
      title: "",
      headline: "Toucan",
    });
  });
});

describe("findProperty fields", () => {
  it("renders data.newAddressTitle", () => {
    const output = getDisplayDetailsForResult(mockFindPropertyResult);

    expect(output).toStrictEqual<Output>({
      key: "Title (new address)",
      iconKey: ComponentType.FindProperty,
      componentType: "Find property",
      title: ".",
      headline: "Mouse",
    });
  });

  it("renders data.newAddressDescription", () => {
    const output = getDisplayDetailsForResult({
      ...mockFindPropertyResult,
      key: "data.newAddressDescription",
    });

    expect(output).toStrictEqual<Output>({
      key: "Description (new address)",
      iconKey: ComponentType.FindProperty,
      componentType: "Find property",
      title: ".",
      headline: "<p>Stingray</p>",
    });
  });

  it("renders data.newAddressDescriptionLabel", () => {
    const output = getDisplayDetailsForResult({
      ...mockFindPropertyResult,
      key: "data.newAddressDescriptionLabel",
    });

    expect(output).toStrictEqual<Output>({
      key: "Description label (new address)",
      iconKey: ComponentType.FindProperty,
      componentType: "Find property",
      title: ".",
      headline: "Scorpion",
    });
  });
});

describe("drawBoundary fields", () => {
  it("renders data.titleForUploading", () => {
    const output = getDisplayDetailsForResult(mockDrawBoundaryResult);

    expect(output).toStrictEqual<Output>({
      key: "Title for uploading",
      iconKey: ComponentType.DrawBoundary,
      componentType: "Draw boundary",
      title: ".",
      headline: "Elephant",
    });
  });

  it("renders data.descriptionForUploading", () => {
    const output = getDisplayDetailsForResult({
      ...mockDrawBoundaryResult,
      key: "data.descriptionForUploading",
    });

    expect(output).toStrictEqual<Output>({
      key: "Description for uploading",
      iconKey: ComponentType.DrawBoundary,
      componentType: "Draw boundary",
      title: ".",
      headline: "<p>Panda</p>",
    });
  });
});

describe("planningConstraints fields", () => {
  it("renders data.disclaimer", () => {
    const output = getDisplayDetailsForResult(mockPlanningConstraintsResult);

    expect(output).toStrictEqual<Output>({
      key: "Disclaimer",
      iconKey: ComponentType.PlanningConstraints,
      componentType: "Planning constraints",
      title: ".",
      headline: "<p>Barracuda</p>",
    });
  });
});

describe("pay fields", () => {
  it("renders data.bannerTitle", () => {
    const output = getDisplayDetailsForResult({
      ...mockPayResult,
      key: "data.bannerTitle",
    });

    expect(output).toStrictEqual<Output>({
      key: "Banner title",
      iconKey: ComponentType.Pay,
      componentType: "Pay",
      title: "Jaguar",
      headline: "Moose",
    });
  });

  it("renders data.instructionsTitle", () => {
    const output = getDisplayDetailsForResult({
      ...mockPayResult,
      key: "data.instructionsTitle",
    });

    expect(output).toStrictEqual<Output>({
      key: "Instructions title",
      iconKey: ComponentType.Pay,
      componentType: "Pay",
      title: "Jaguar",
      headline: "Pelican",
    });
  });

  it("renders data.instructionsDescription", () => {
    const output = getDisplayDetailsForResult({
      ...mockPayResult,
      key: "data.instructionsDescription",
    });

    expect(output).toStrictEqual<Output>({
      key: "Instructions description",
      iconKey: ComponentType.Pay,
      componentType: "Pay",
      title: "Jaguar",
      headline: "<p>Cockatoo</p>",
    });
  });

  it("renders data.secondaryPageTitle", () => {
    const output = getDisplayDetailsForResult({
      ...mockPayResult,
      key: "data.secondaryPageTitle",
    });

    expect(output).toStrictEqual<Output>({
      key: "Secondary page title",
      iconKey: ComponentType.Pay,
      componentType: "Pay",
      title: "Jaguar",
      headline: "Chicken",
    });
  });

  it("renders data.nomineeTitle", () => {
    const output = getDisplayDetailsForResult({
      ...mockPayResult,
      key: "data.nomineeTitle",
    });

    expect(output).toStrictEqual<Output>({
      key: "Nominee title",
      iconKey: ComponentType.Pay,
      componentType: "Pay",
      title: "Jaguar",
      headline: "Aardvark",
    });
  });

  it("renders data.nomineeDescription", () => {
    const output = getDisplayDetailsForResult({
      ...mockPayResult,
      key: "data.nomineeDescription",
    });

    expect(output).toStrictEqual<Output>({
      key: "Nominee description",
      iconKey: ComponentType.Pay,
      componentType: "Pay",
      title: "Jaguar",
      headline: "<p>Cheetah</p>",
    });
  });

  it("renders data.yourDetailsTitle", () => {
    const output = getDisplayDetailsForResult({
      ...mockPayResult,
      key: "data.yourDetailsTitle",
    });

    expect(output).toStrictEqual<Output>({
      key: "Title (your details)",
      iconKey: ComponentType.Pay,
      componentType: "Pay",
      title: "Jaguar",
      headline: "Camel",
    });
  });

  it("renders data.yourDetailsDescription", () => {
    const output = getDisplayDetailsForResult({
      ...mockPayResult,
      key: "data.yourDetailsDescription",
    });

    expect(output).toStrictEqual<Output>({
      key: "Description (your details)",
      iconKey: ComponentType.Pay,
      componentType: "Pay",
      title: "Jaguar",
      headline: "<p>Macaw</p>",
    });
  });

  it("renders data.yourDetailsLabel", () => {
    const output = getDisplayDetailsForResult({
      ...mockPayResult,
      key: "data.yourDetailsLabel",
    });

    expect(output).toStrictEqual<Output>({
      key: "Label (your details)",
      iconKey: ComponentType.Pay,
      componentType: "Pay",
      title: "Jaguar",
      headline: "Skunk",
    });
  });

  it("renders data.govPayMetadata.key", () => {
    const output = getDisplayDetailsForResult({
      ...mockPayResult,
      key: "data.govPayMetadata.key",
    });

    expect(output).toStrictEqual<Output>({
      key: "GOV.UK Pay metadata (key)",
      iconKey: ComponentType.Pay,
      componentType: "Pay",
      title: "Jaguar",
      headline: "Tapir",
    });
  });

  it("renders data.govPayMetadata.value", () => {
    const output = getDisplayDetailsForResult({
      ...mockPayResult,
      key: "data.govPayMetadata.value",
    });

    expect(output).toStrictEqual<Output>({
      key: "GOV.UK Pay metadata (value)",
      iconKey: ComponentType.Pay,
      componentType: "Pay",
      title: "Jaguar",
      headline: "Okapi",
    });
  });
});

// Use the IMMUNE flag as a proxy for all flags values, within all flag sets
describe("result fields", () => {
  it("renders the heading", () => {
    const output = getDisplayDetailsForResult({
      ...mockResultResult,
      key: "data.overrides.IMMUNE.heading",
    });

    expect(output).toStrictEqual<Output>({
      key: "Heading (IMMUNE flag)",
      iconKey: ComponentType.Result,
      componentType: "Result",
      title: "",
      headline: "Squid",
    });
  });

  it("renders the description", () => {
    const output = getDisplayDetailsForResult({
      ...mockResultResult,
      key: "data.overrides.IMMUNE.description",
    });

    expect(output).toStrictEqual<Output>({
      key: "Description (IMMUNE flag)",
      iconKey: ComponentType.Result,
      componentType: "Result",
      title: "",
      headline: "Eagle",
    });
  });
});
