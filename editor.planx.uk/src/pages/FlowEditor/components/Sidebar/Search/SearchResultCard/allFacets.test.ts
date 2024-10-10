import { ComponentType } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";

import { mockChecklistResult, mockFlow, mockPayResult, mockQuestionResult } from "../mocks/allFacetFlow";
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
  it.todo("renders data.categories.title");
});

describe("nextSteps fields", () => {
  it.todo("renders data.steps.title");
  it.todo("renders data.steps.description");
  it.todo("renders data.steps.url");
});

describe("fileUploadAndLabel fields", () => {
  it.todo("renders data.fileTypes.name");
  it.todo("renders data.fileTypes.moreInformation.notes");
  it.todo("renders data.fileTypes.moreInformation.howMeasured");
  it.todo("renders data.fileTypes.moreInformation.policyRef");
  it.todo("renders data.fileTypes.moreInformation.info");
});

describe("schemaComponents fields", () => {
  it.todo("renders data.schemaName");
  it.todo("renders data.schema.fields.data.title");
  it.todo("renders data.schema.fields.data.description");
  it.todo("renders data.schema.fields.data.options.data.description");
  it.todo("renders data.schema.fields.data.options.text");
});

describe("taskList fields", () => {
  it.todo("renders data.tasks.title");
  it.todo("renders data.tasks.description");
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
