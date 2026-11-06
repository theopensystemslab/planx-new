import { readability } from "@ctrl/tinycolor";
import type { TeamTheme } from "@opensystemslab/planx-core/types";
import { ensureContrastOnDark } from "styleUtils";

import {
  DARK_BACKGROUND_COLOR,
  DARK_PRIMARY_COLOR,
  DEFAULT_CONTRAST_THRESHOLD,
  DEFAULT_PRIMARY_COLOR,
  defaultDarkTheme,
  defaultTheme,
  generateTeamTheme,
} from "./theme";

const mockTeamTheme = (colour: string): TeamTheme => ({
  primaryColour: colour,
  actionColour: colour,
  linkColour: colour,
  logo: null,
  favicon: null,
});

// A spread of team colours chosen against a white background, from very dark to very light
const TEAM_COLOURS = [
  DEFAULT_PRIMARY_COLOR,
  "#000000",
  "#0B0C0C",
  "#00703C",
  "#D4351C",
  "#4C2C92",
  "#FFDD00",
  "#FFFFFF",
];

describe("ensureContrastOnDark", () => {
  test("returns a colour which already meets the contrast threshold unchanged", () => {
    expect(ensureContrastOnDark("#ffdd00", DARK_BACKGROUND_COLOR)).toBe(
      "#ffdd00",
    );
  });

  test.each(TEAM_COLOURS)(
    "lightens %s to meet the contrast threshold",
    (colour) => {
      const adjusted = ensureContrastOnDark(colour, DARK_BACKGROUND_COLOR);
      expect(
        readability(adjusted, DARK_BACKGROUND_COLOR),
      ).toBeGreaterThanOrEqual(DEFAULT_CONTRAST_THRESHOLD);
    },
  );
});

describe("generateTeamTheme", () => {
  test("defaults to light mode", () => {
    expect(defaultTheme.palette.mode).toBe("light");
    // Serialise to compare colour values, as palette helper functions differ by reference
    expect(JSON.stringify(generateTeamTheme().palette)).toEqual(
      JSON.stringify(generateTeamTheme(undefined, "light").palette),
    );
  });

  test("does not adjust team colours in light mode", () => {
    const { palette } = generateTeamTheme(mockTeamTheme("#FFDD00"));
    expect(palette.primary.main).toBe("#FFDD00");
    expect(palette.link.main).toBe("#FFDD00");
    expect(palette.prompt.main).toBe("#FFDD00");
    // Light mode always uses white text on the primary colour
    expect(palette.primary.contrastText).toBe("#FFFFFF");
  });

  test("uses the specified dark primary colour for PlanX default team colours", () => {
    for (const { palette } of [
      defaultDarkTheme,
      generateTeamTheme(mockTeamTheme("#0010a4"), "dark"),
    ]) {
      expect(palette.primary.main).toBe(DARK_PRIMARY_COLOR);
      expect(palette.link.main).toBe(DARK_PRIMARY_COLOR);
      expect(palette.prompt.main).toBe(DARK_PRIMARY_COLOR);
    }
  });

  test("adjusts custom team colours in dark mode", () => {
    const { palette } = generateTeamTheme(mockTeamTheme("#00703C"), "dark");
    const adjusted = ensureContrastOnDark("#00703C", DARK_BACKGROUND_COLOR);
    expect(palette.primary.main).toBe(adjusted);
    expect(palette.link.main).toBe(adjusted);
    expect(palette.prompt.main).toBe(adjusted);
  });

  test("generates a dark theme", () => {
    expect(defaultDarkTheme.palette.mode).toBe("dark");
    expect(defaultDarkTheme.palette.background.default).toBe(
      DARK_BACKGROUND_COLOR,
    );
  });

  test.each(TEAM_COLOURS)(
    "team colour %s meets the contrast threshold in dark mode",
    (colour) => {
      const { palette } = generateTeamTheme(mockTeamTheme(colour), "dark");
      const background = palette.background.default;

      for (const foreground of [
        palette.primary.main,
        palette.link.main,
        palette.prompt.main,
      ]) {
        expect(readability(foreground, background)).toBeGreaterThanOrEqual(
          DEFAULT_CONTRAST_THRESHOLD,
        );
      }

      // Text on team colours remains legible
      expect(
        readability(palette.primary.contrastText, palette.primary.main),
      ).toBeGreaterThanOrEqual(DEFAULT_CONTRAST_THRESHOLD);
      expect(
        readability(palette.prompt.contrastText, palette.prompt.main),
      ).toBeGreaterThanOrEqual(DEFAULT_CONTRAST_THRESHOLD);
    },
  );

  test.each([
    ["text.primary", (p: typeof defaultDarkTheme.palette) => p.text.primary],
    [
      "text.secondary",
      (p: typeof defaultDarkTheme.palette) => p.text.secondary,
    ],
    ["error.main", (p: typeof defaultDarkTheme.palette) => p.error.main],
  ])(
    "dark mode %s meets the contrast threshold on default and paper backgrounds",
    (_, getColour) => {
      const { palette } = defaultDarkTheme;
      const colour = getColour(palette);
      expect(
        readability(colour, palette.background.default),
      ).toBeGreaterThanOrEqual(DEFAULT_CONTRAST_THRESHOLD);
      expect(
        readability(colour, palette.background.paper),
      ).toBeGreaterThanOrEqual(DEFAULT_CONTRAST_THRESHOLD);
    },
  );
});
