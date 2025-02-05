import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import RichTextInput from "ui/editor/RichTextInput/RichTextInput";

import { modifyDeep } from "./utils";

test("modifyDeep helper", () => {
  /**
   * This example traverses a nested structure and increments every even number. The modifier function
   * returns `null` for every level where it didn't find a number, instructing the function to leave
   * the value unchanged at that level but keep traversing downwards to see if there is something to change.
   */
  expect(
    modifyDeep((val) => {
      if (typeof val !== "number") return null;
      const isEven = val % 2 === 0;
      return isEven ? val + 1 : val;
    })({
      a: { c: { val: 2 } },
      b: { val: 3 },
      d: [1, 2, 3, 4],
    }),
  ).toEqual({
    a: { c: { val: 3 } },
    b: { val: 3 },
    d: [1, 3, 3, 5],
  });
});

describe("input validation", () => {
  it("does not display an error if the text '(opens in a new tab)' is wrapped in an anchor element", async () => {
    setup(
      <RichTextInput
        value={'<a href="#">Some link (opens in a new tab)</a>'}
      />,
    );

    const errorIcon = screen.queryByTestId("ErrorIcon");
    expect(errorIcon).not.toBeInTheDocument();
  });

  it("displays an error if the text '(opens in a new tab)' is not wrapped in an anchor element", async () => {
    const { user } = setup(
      <RichTextInput
        value={'<p><a href="#">Some link</a> (opens in a new tab)</p>'}
      />,
    );

    const errorIcon = screen.getByTestId("ErrorIcon");
    expect(errorIcon).toBeVisible();

    await user.click(errorIcon);
    expect(
      screen.getByText('Links must wrap the text "(opens in a new tab)"'),
    ).toBeVisible();
  });

  it("displays an error if the policy legislation link contains '/made'", async () => {
    const { user } = setup(
      <RichTextInput
        value={
          '<p><a href="https://www.legislation.gov.uk/ukpga/2023/36/section/3/made">Link to policy</a></p>'
        }
      />,
    );

    const errorIcon = screen.getByTestId("ErrorIcon");
    expect(errorIcon).toBeVisible();

    await user.click(errorIcon);
    expect(
      screen.getByText(
        'Legislative policy links should not end in "/made" as these can be out of date.',
      ),
    ).toBeVisible();
  });

  it("does not display an error if the policy legislation link does not contain '/made'", async () => {
    setup(
      <RichTextInput
        value={
          '<p><a href="https://www.legislation.gov.uk/ukpga/2023/36/section/3">Link to policy</a></p>'
        }
      />,
    );

    const errorIcon = screen.queryByTestId("ErrorIcon");
    expect(errorIcon).not.toBeInTheDocument();
  });
});
