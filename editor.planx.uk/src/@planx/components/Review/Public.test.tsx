import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import Review from "./Public/Presentational";

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  render(
    <Review
      flow={{}}
      breadcrumbs={{}}
      passport={{}}
      changeAnswer={() => {}}
      handleSubmit={handleSubmit}
    />
  );

  userEvent.click(screen.getByText("Continue"));

  expect(handleSubmit).toHaveBeenCalled();
});
