import React from "react";
import { setup } from "testUtils";
import { FONT_WEIGHT_BOLD } from "theme";
import { axe } from "vitest-axe";

import { Headline } from "./Headline";

const sampleText = "The quick fox jumps...";
const foxIndices: [number, number][] = [[10, 13]];

const DEFAULT_FONT_WEIGHT = "400";

it("displays matches from the headline in bold", async () => {
  const { getByText } = await setup(
    <Headline text={sampleText} matchIndices={foxIndices} variant="data" />,
  );

  // Input text is split into characters in order to highlight a substring
  const tStyle = window.getComputedStyle(getByText("T"));
  const hStyle = window.getComputedStyle(getByText("h"));
  const eStyle = window.getComputedStyle(getByText("e"));

  // Non matching text is not in bold
  expect(tStyle.fontWeight).toEqual(DEFAULT_FONT_WEIGHT);
  expect(hStyle.fontWeight).toEqual(DEFAULT_FONT_WEIGHT);
  expect(eStyle.fontWeight).toEqual(DEFAULT_FONT_WEIGHT);

  const fStyle = window.getComputedStyle(getByText("f"));
  const oStyle = window.getComputedStyle(getByText("o"));
  const xStyle = window.getComputedStyle(getByText("x"));

  // Matching text is in bold
  expect(fStyle.fontWeight).toEqual(FONT_WEIGHT_BOLD);
  expect(oStyle.fontWeight).toEqual(FONT_WEIGHT_BOLD);
  expect(xStyle.fontWeight).toEqual(FONT_WEIGHT_BOLD);
});

it("should not have any accessibility violations on initial load", async () => {
  const { container } = await setup(
    <Headline text={sampleText} matchIndices={foxIndices} variant="data" />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
