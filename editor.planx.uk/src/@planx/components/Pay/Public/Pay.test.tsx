import { render, screen } from "@testing-library/react";
import React from "react";

import Pay from "./Pay";

it("renders correctly", () => {
  render(
    <Pay
      handleSubmit={jest.fn()}
      url={"test-url"}
      title="Pay for your application"
    />
  );

  const title = screen.getByText("Pay for your application");
  expect(title).toBeTruthy();
});
