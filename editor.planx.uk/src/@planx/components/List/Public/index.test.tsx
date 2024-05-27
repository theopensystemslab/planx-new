import React from "react";
import { axe, setup } from "testUtils";

import ListComponent, { Props } from "../Public";
import { Zoo } from "../schemas/Zoo";

const mockProps: Props = {
  fn: "mock",
  schema: Zoo,
  schemaName: "Zoo",
  title: "Mock Title",
  description: "Mock description",
};

describe("Basic UI", () => {
  it.todo("renders correctly");

  it.todo("parses provided schema to render expected form");

  it("should not have any accessibility violations", async () => {
    const { container } = setup(<ListComponent {...mockProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Navigating back", () => {
  test.todo("it pre-populates list correctly");
});

describe("Building a list", () => {
  test.todo("Adding an item");
  test.todo("Editing an item");
  test.todo("Removing an item");
});

describe("Form validation and error handling", () => {
  test.todo("Text field");
  test.todo("Number field");
  test.todo("Question field - select");
  test.todo("Question field - radio");
});
