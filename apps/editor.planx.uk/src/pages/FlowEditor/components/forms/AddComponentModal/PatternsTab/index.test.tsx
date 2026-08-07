import { act, screen, waitFor, within } from "@testing-library/react";
import { delay, graphql, HttpResponse } from "msw";
import server from "test/mockServer";
import { setup } from "test/utils";

import { PatternsTab } from ".";
import { mockPatternData, mockPatterns } from "./mocks";

const patternsHandler = (patterns = mockPatterns) =>
  graphql.query("GetPatterns", () => HttpResponse.json({ data: { patterns } }));

const patternDataHandler = (data: unknown = mockPatternData) =>
  graphql.query("GetPatternData", ({ variables }) =>
    HttpResponse.json({ data: { pattern: { id: variables.id, data } } }),
  );

const errorHandler = (operation: "GetPatterns" | "GetPatternData") =>
  graphql.query(operation, () =>
    HttpResponse.json({ errors: [{ message: "Something went wrong" }] }),
  );

const waitForPatterns = () =>
  screen.findByRole("button", { name: /Pattern 1/ });

/** Wait for a pattern's name to appear in the detail panel, not the list */
const findInPanel = async (name: string) =>
  within(await screen.findByTestId("pattern-detail-panel")).findByText(name);

describe("PatternsTab", () => {
  describe("the pattern list", () => {
    it("renders each pattern returned by the query", async () => {
      server.use(patternsHandler(), patternDataHandler());
      await setup(<PatternsTab onInsert={vi.fn()} />);

      await waitForPatterns();

      mockPatterns.forEach(({ name }) => {
        expect(screen.getByRole("button", { name })).toBeInTheDocument();
      });
    });

    it("shows a loading indicator while fetching", async () => {
      server.use(
        graphql.query("GetPatterns", async () => {
          await delay(100);
          return HttpResponse.json({
            data: { patterns: mockPatterns },
          });
        }),
        patternDataHandler(),
      );
      await setup(<PatternsTab onInsert={vi.fn()} />);

      expect(await screen.findByText("Loading patterns")).toBeInTheDocument();

      await waitForPatterns();
      expect(screen.queryByText("Loading patterns")).not.toBeInTheDocument();
    });

    it("shows an error message if the patterns query fails", async () => {
      server.use(errorHandler("GetPatterns"), patternDataHandler());
      await setup(<PatternsTab onInsert={vi.fn()} />);

      expect(
        await screen.findByText("Couldn't load patterns."),
      ).toBeInTheDocument();
    });

    it("shows an empty state when there are no patterns", async () => {
      server.use(patternsHandler([]), patternDataHandler());
      await setup(<PatternsTab onInsert={vi.fn()} />);

      expect(
        await screen.findByText("No patterns available yet."),
      ).toBeInTheDocument();
    });
  });

  describe("searching", () => {
    it("filters the list to matching patterns", async () => {
      server.use(patternsHandler(), patternDataHandler());
      const { user } = await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      await user.type(
        screen.getByPlaceholderText("Search patterns"),
        "Pattern 2",
      );

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Pattern 2/ }),
        ).toBeInTheDocument();
        expect(
          screen.queryByRole("button", { name: /Pattern 1/ }),
        ).not.toBeInTheDocument();
      });
    });

    it("shows a distinct message when nothing matches the search", async () => {
      server.use(patternsHandler(), patternDataHandler());
      const { user } = await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      await user.type(
        screen.getByPlaceholderText("Search patterns"),
        "no-such-pattern",
      );

      expect(
        await screen.findByText("No patterns match your search."),
      ).toBeInTheDocument();
    });
  });

  describe("the detail panel", () => {
    it("prompts you to pick a pattern before one is previewed", async () => {
      server.use(patternsHandler(), patternDataHandler());
      await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      expect(
        screen.getByText("Hover a pattern to see details."),
      ).toBeInTheDocument();
    });

    it("shows the hovered pattern's details and component count", async () => {
      server.use(patternsHandler(), patternDataHandler());
      const { user } = await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      await user.hover(screen.getByRole("button", { name: /Pattern 3/ }));

      // Answer nodes excluded from count
      expect(await screen.findByText("2 components")).toBeInTheDocument();
      expect(
        screen.queryByText("Hover a pattern to see details."),
      ).not.toBeInTheDocument();
    });

    it("follows the cursor from pattern to pattern", async () => {
      server.use(patternsHandler(), patternDataHandler());
      const { user } = await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      await user.hover(screen.getByRole("button", { name: /Pattern 3/ }));
      await findInPanel("Pattern 3");

      await user.hover(screen.getByRole("button", { name: /Pattern 4/ }));
      expect(await findInPanel("Pattern 4")).toBeInTheDocument();
    });

    it("previews a pattern when its row is focused by keyboard", async () => {
      server.use(patternsHandler(), patternDataHandler());
      await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      act(() => screen.getByTestId("pattern-1").focus());

      expect(await findInPanel("Pattern 1")).toBeInTheDocument();
    });

    it("doesn't call a pattern empty while its graph is still loading", async () => {
      server.use(
        patternsHandler(),
        graphql.query("GetPatternData", async ({ variables }) => {
          await delay(100);
          return HttpResponse.json({
            data: { pattern: { id: variables.id, data: mockPatternData } },
          });
        }),
      );
      const { user } = await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      await user.hover(screen.getByRole("button", { name: /Pattern 3/ }));

      expect(
        screen.queryByText("This pattern has no components to insert."),
      ).not.toBeInTheDocument();
      expect(await screen.findByText("2 components")).toBeInTheDocument();
    });

    it("only fetches a pattern's graph once it's previewed", async () => {
      const requested: string[] = [];
      server.use(
        patternsHandler(),
        graphql.query("GetPatternData", ({ variables }) => {
          requested.push(variables.id);
          return HttpResponse.json({
            data: {
              pattern: {
                __typename: "flows",
                id: variables.id,
                data: mockPatternData,
              },
            },
          });
        }),
      );
      const { user } = await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      // No pattern data initially requested
      expect(requested).toEqual([]);

      await user.hover(screen.getByRole("button", { name: /Pattern 3/ }));
      await screen.findByText("2 components");

      // Specific pattern data has now been requested
      expect(requested).toEqual(["3"]);
    });
  });

  describe("inserting", () => {
    it("inserts the pattern you click in the list", async () => {
      const onInsert = vi.fn();
      server.use(patternsHandler(), patternDataHandler());
      const { user } = await setup(<PatternsTab onInsert={onInsert} />);
      await waitForPatterns();

      await user.hover(screen.getByRole("button", { name: /Pattern 3/ }));
      await screen.findByText("2 components");

      await user.click(screen.getByRole("button", { name: /Pattern 3/ }));

      expect(onInsert).toHaveBeenCalledWith(mockPatternData);
    });

    it("waits for the graph when clicked before the preview has loaded", async () => {
      const onInsert = vi.fn();
      server.use(
        patternsHandler(),
        graphql.query("GetPatternData", async ({ variables }) => {
          await delay(100);
          return HttpResponse.json({
            data: { pattern: { id: variables.id, data: mockPatternData } },
          });
        }),
      );
      const { user } = await setup(<PatternsTab onInsert={onInsert} />);
      await waitForPatterns();

      await user.click(screen.getByRole("button", { name: /Pattern 3/ }));
      expect(onInsert).not.toHaveBeenCalled();

      await waitFor(() =>
        expect(onInsert).toHaveBeenCalledWith(mockPatternData),
      );
    });

    it("blocks insertion of a pattern with no components", async () => {
      const onInsert = vi.fn();
      server.use(patternsHandler(), patternDataHandler({ _root: {} }));
      const { user } = await setup(<PatternsTab onInsert={onInsert} />);
      await waitForPatterns();

      await user.click(screen.getByRole("button", { name: /Pattern 3/ }));

      expect(
        await screen.findByText("This pattern has no components to insert."),
      ).toBeInTheDocument();
      expect(onInsert).not.toHaveBeenCalled();
    });

    it("blocks insertion if the graph fails to load", async () => {
      const onInsert = vi.fn();
      server.use(patternsHandler(), errorHandler("GetPatternData"));
      const { user } = await setup(<PatternsTab onInsert={onInsert} />);
      await waitForPatterns();

      await user.click(screen.getByRole("button", { name: /Pattern 3/ }));

      expect(
        await screen.findByText("Couldn't load this pattern."),
      ).toBeInTheDocument();
      expect(onInsert).not.toHaveBeenCalled();
    });
  });
});
