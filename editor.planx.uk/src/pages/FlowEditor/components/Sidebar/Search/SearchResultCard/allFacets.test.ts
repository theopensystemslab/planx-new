import { ComponentType } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";

import {
  mockChecklistOptionResult,
  mockChecklistResult,
  mockConfirmationResult,
  mockContentResult,
  mockDrawBoundaryResult,
  mockFeedbackResult,
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
      matchValue: "Peacock",
    });

    expect(output).toStrictEqual<Output>({
      key: "Description",
      iconKey: ComponentType.Question,
      componentType: "Question",
      title: "Seahorse",
      headline: "Peacock",
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
      matchValue: "Echidna",
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
      matchValue: "Gazelle",
    });

    expect(output).toStrictEqual<Output>({
      key: "How is it defined",
      iconKey: ComponentType.Question,
      componentType: "Question",
      title: "Seahorse",
      headline: "Gazelle",
    });
  });

  it("renders data.policyRef", () => {
    const output = getDisplayDetailsForResult({
      ...mockQuestionResult,
      key: "data.policyRef",
      matchValue: "Rat",
    });

    expect(output).toStrictEqual<Output>({
      key: "Policy reference",
      iconKey: ComponentType.Question,
      componentType: "Question",
      title: "Seahorse",
      headline: "Rat",
    });
  });

  it("renders data.info", () => {
    const output = getDisplayDetailsForResult({
      ...mockQuestionResult,
      key: "data.info",
      matchValue: "Octopus",
    });

    expect(output).toStrictEqual<Output>({
      key: "Why it matters",
      iconKey: ComponentType.Question,
      componentType: "Question",
      title: "Seahorse",
      headline: "Octopus",
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
      matchValue: "Vulture",
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
      matchValue: "https://www.starfish.gov.uk",
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
      matchValue: "Kangaroo",
    });

    expect(output).toStrictEqual<Output>({
      key: "Why it matters (file type)",
      iconKey: ComponentType.FileUploadAndLabel,
      componentType: "File upload and label",
      title: ".",
      headline: "Kangaroo",
    });
  });

  it("renders data.fileTypes.moreInformation.policyRef", () => {
    const output = getDisplayDetailsForResult({
      ...mockFileUploadAndLabelResult,
      key: "data.fileTypes.moreInformation.policyRef",
      matchValue: "Tiger",
    });

    expect(output).toStrictEqual<Output>({
      key: "Policy reference (file type)",
      iconKey: ComponentType.FileUploadAndLabel,
      componentType: "File upload and label",
      title: ".",
      headline: "Tiger",
    });
  });

  it("renders data.fileTypes.moreInformation.howMeasured", () => {
    const output = getDisplayDetailsForResult({
      ...mockFileUploadAndLabelResult,
      key: "data.fileTypes.moreInformation.howMeasured",
      matchValue: "Salamander",
    });

    expect(output).toStrictEqual<Output>({
      key: "How is it defined (file type)",
      iconKey: ComponentType.FileUploadAndLabel,
      componentType: "File upload and label",
      title: ".",
      headline: "Salamander",
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
      matchValue: "Donkey",
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
      matchValue: "Alpaca",
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
      matchValue: "Iguana",
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
      matchValue: "Parrot",
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
      matchValue: "Beaver",
    });

    expect(output).toStrictEqual<Output>({
      key: "Description (task)",
      iconKey: ComponentType.TaskList,
      componentType: "Task list",
      title: ".",
      headline: "Beaver",
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
      headline: "Sheep",
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
      matchValue: "Tarantula",
    });

    expect(output).toStrictEqual<Output>({
      key: "More information",
      iconKey: ComponentType.Confirmation,
      componentType: "Confirmation",
      title: "",
      headline: "Tarantula",
    });
  });

  it("renders data.contactInfo", () => {
    const output = getDisplayDetailsForResult({
      ...mockConfirmationResult,
      key: "data.contactInfo",
      matchValue: "Weasel",
    });

    expect(output).toStrictEqual<Output>({
      key: "Contact information",
      iconKey: ComponentType.Confirmation,
      componentType: "Confirmation",
      title: "",
      headline: "Weasel",
    });
  });

  it("renders data.nextSteps.title", () => {
    const output = getDisplayDetailsForResult({
      ...mockConfirmationResult,
      key: "data.nextSteps.title",
      matchValue: "Llama",
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
      matchValue: "Toucan",
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
      matchValue: "Stingray",
    });

    expect(output).toStrictEqual<Output>({
      key: "Description (new address)",
      iconKey: ComponentType.FindProperty,
      componentType: "Find property",
      title: ".",
      headline: "Stingray",
    });
  });

  it("renders data.newAddressDescriptionLabel", () => {
    const output = getDisplayDetailsForResult({
      ...mockFindPropertyResult,
      key: "data.newAddressDescriptionLabel",
      matchValue: "Scorpion",
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
      matchValue: "Panda",
    });

    expect(output).toStrictEqual<Output>({
      key: "Description for uploading",
      iconKey: ComponentType.DrawBoundary,
      componentType: "Draw boundary",
      title: ".",
      headline: "Panda",
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
      headline: "Barracuda",
    });
  });
});

describe("pay fields", () => {
  it("renders data.bannerTitle", () => {
    const output = getDisplayDetailsForResult({
      ...mockPayResult,
      key: "data.bannerTitle",
      matchValue: "Moose",
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
      matchValue: "Pelican",
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
      matchValue: "Cockatoo",
    });

    expect(output).toStrictEqual<Output>({
      key: "Instructions description",
      iconKey: ComponentType.Pay,
      componentType: "Pay",
      title: "Jaguar",
      headline: "Cockatoo",
    });
  });

  it("renders data.secondaryPageTitle", () => {
    const output = getDisplayDetailsForResult({
      ...mockPayResult,
      key: "data.secondaryPageTitle",
      matchValue: "Chicken",
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
      matchValue: "Aardvark",
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
      matchValue: "Cheetah",
    });

    expect(output).toStrictEqual<Output>({
      key: "Nominee description",
      iconKey: ComponentType.Pay,
      componentType: "Pay",
      title: "Jaguar",
      headline: "Cheetah",
    });
  });

  it("renders data.yourDetailsTitle", () => {
    const output = getDisplayDetailsForResult({
      ...mockPayResult,
      key: "data.yourDetailsTitle",
      matchValue: "Camel",
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
      matchValue: "Macaw",
    });

    expect(output).toStrictEqual<Output>({
      key: "Description (your details)",
      iconKey: ComponentType.Pay,
      componentType: "Pay",
      title: "Jaguar",
      headline: "Macaw",
    });
  });

  it("renders data.yourDetailsLabel", () => {
    const output = getDisplayDetailsForResult({
      ...mockPayResult,
      key: "data.yourDetailsLabel",
      matchValue: "Skunk",
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
      matchValue: "Tapir",
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
      matchValue: "Okapi",
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
      key: "data.overrides.flag.pp.immune.heading",
      matchValue: "Squid",
    });

    expect(output).toStrictEqual<Output>({
      key: "Heading (flag.pp.immune flag)",
      iconKey: ComponentType.Result,
      componentType: "Result",
      title: "",
      headline: "Squid",
    });
  });

  it("renders the description", () => {
    const output = getDisplayDetailsForResult({
      ...mockResultResult,
      key: "data.overrides.flag.pp.immune.description",
      matchValue: "Eagle",
    });

    expect(output).toStrictEqual<Output>({
      key: "Description (flag.pp.immune flag)",
      iconKey: ComponentType.Result,
      componentType: "Result",
      title: "",
      headline: "Eagle",
    });
  });
});

describe("feedback fields", () => {
  it("renders data.ratingQuestion", () => {
    const output = getDisplayDetailsForResult(mockFeedbackResult);

    expect(output).toStrictEqual<Output>({
      key: "Rating question",
      iconKey: ComponentType.Feedback,
      componentType: "Feedback",
      title: "title text",
      headline: "Bullfrog",
    });
  });

  it("renders data.freeformQuestion", () => {
    const output = getDisplayDetailsForResult({
      ...mockFeedbackResult,
      key: "data.freeformQuestion",
      matchValue: "Oarfish",
    });

    expect(output).toStrictEqual<Output>({
      key: "Freeform question",
      iconKey: ComponentType.Feedback,
      componentType: "Feedback",
      title: "title text",
      headline: "Oarfish",
    });
  });

  it("renders data.disclaimer", () => {
    const output = getDisplayDetailsForResult({
      ...mockFeedbackResult,
      key: "data.disclaimer",
      matchValue: "Wagtail",
    });

    expect(output).toStrictEqual<Output>({
      key: "Disclaimer",
      iconKey: ComponentType.Feedback,
      componentType: "Feedback",
      title: "title text",
      headline: "Wagtail",
    });
  });
});
