import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import FileUpload from "./Public";

test("renders correctly and blocks submit if there are no files added", async () => {
  const handleSubmit = jest.fn();

  render(<FileUpload handleSubmit={handleSubmit} />);

  userEvent.click(screen.getByText("Continue"));

  expect(handleSubmit).toHaveBeenCalledTimes(0);
});

test.todo("cannot continue until uploads have finished");
