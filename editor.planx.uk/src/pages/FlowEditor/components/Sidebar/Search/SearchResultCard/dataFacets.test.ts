import { ComponentType } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";

import {
  mockAnswerResult,
  mockCalculateFormulaResult,
  mockCalculateRootResult,
  mockFileUploadAndLabelResult,
  mockFlow,
  mockListAnswerResult,
  mockListDataResult,
  mockListRootResult,
  mockQuestionResult,
} from "../mocks/getDisplayDetailsForResult";
import { getDisplayDetailsForResult } from "./getDisplayDetailsForResult";

type Output = ReturnType<typeof getDisplayDetailsForResult>;

// Setup flow so that it can be referenced by SearchResults (e.g. getting parent nodes)
beforeAll(() => useStore.setState({ flow: mockFlow }));

describe("Question component", () => {
  it("returns the expected display values", () => {
    const output = getDisplayDetailsForResult(mockQuestionResult);

    expect(output).toStrictEqual<Output>({
      key: "Data",
      iconKey: ComponentType.Question,
      componentType: "Question",
      title: "This is a question component",
      headline: "colour",
    });
  });
});

describe("Answer component", () => {
  it("returns the expected display values", () => {
    const output = getDisplayDetailsForResult(mockAnswerResult);

    expect(output).toStrictEqual<Output>({
      key: "Option (data)",
      iconKey: ComponentType.Question,
      componentType: "Question",
      title: "This is a question component",
      headline: "red",
    });
  });
});

describe("List component", () => {
  it("handles the root data value", () => {
    const output = getDisplayDetailsForResult(mockListRootResult);

    expect(output).toStrictEqual<Output>({
      componentType: "List",
      headline: "listRoot",
      iconKey: ComponentType.List,
      key: "Data",
      title: "This is a list component",
    });
  });

  it("handles nested data variables", () => {
    const output = getDisplayDetailsForResult(mockListDataResult);

    expect(output).toStrictEqual<Output>({
      componentType: "List",
      headline: "tenure",
      iconKey: ComponentType.List,
      key: "Data",
      title: "This is a list component",
    });
  });

  it("handles nested data variables in Answers", () => {
    const output = getDisplayDetailsForResult(mockListAnswerResult);

    expect(output).toStrictEqual<Output>({
      componentType: "List",
      headline: "selfCustomBuild",
      iconKey: ComponentType.List,
      key: "Option (data)",
      title: "This is a list component",
    });
  });
});

describe("Calculate component", () => {
  it("handles the output data variables", () => {
    const output = getDisplayDetailsForResult(mockCalculateRootResult);

    expect(output).toStrictEqual<Output>({
      componentType: "Calculate",
      headline: "calculateOutput",
      iconKey: ComponentType.Calculate,
      key: "Output (data)",
      title: "This is a calculate component",
    });
  });

  it("handles the formula data variables", () => {
    const output = getDisplayDetailsForResult(mockCalculateFormulaResult);

    expect(output).toStrictEqual<Output>({
      componentType: "Calculate",
      headline: "formulaOne + formulaTwo",
      iconKey: ComponentType.Calculate,
      key: "Formula",
      title: "This is a calculate component",
    });
  });
});

describe("FileUploadAndLabel component", () => {
  it("handles the data variables nested in FileTypes", () => {
    const output = getDisplayDetailsForResult(mockFileUploadAndLabelResult);

    expect(output).toStrictEqual<Output>({
      componentType: "File upload and label",
      headline: "floorplan",
      iconKey: ComponentType.FileUploadAndLabel,
      key: "File type (data)",
      title: "This is a FileUploadAndLabel component",
    });
  });
});
