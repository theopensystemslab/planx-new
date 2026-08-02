import { screen, waitFor } from "@testing-library/react";
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
    it("prompts you to pick a pattern before one is selected", async () => {
      server.use(patternsHandler(), patternDataHandler());
      await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      expect(
        screen.getByText("Select a pattern to see details."),
      ).toBeInTheDocument();
    });

    it("shows the selected pattern's details and component count", async () => {
      server.use(patternsHandler(), patternDataHandler());
      const { user } = await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      await user.click(screen.getByRole("button", { name: /Pattern 3/ }));

      expect(await screen.findByText("3 components")).toBeInTheDocument();
      expect(
        screen.queryByText("Select a pattern to see details."),
      ).not.toBeInTheDocument();
    });

    it("closing the panel clears the selection", async () => {
      server.use(patternsHandler(), patternDataHandler());
      const { user } = await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      await user.click(screen.getByRole("button", { name: /Pattern 3/ }));
      await screen.findByText("3 components");

      await user.click(
        screen.getByRole("button", { name: "Close Pattern 3 details" }),
      );

      expect(
        screen.getByText("Select a pattern to see details."),
      ).toBeInTheDocument();
    });

    it("only fetches a pattern's graph once it's selected", async () => {
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

      await user.click(screen.getByRole("button", { name: /Pattern 3/ }));
      await screen.findByText("3 components");

      // Specific pattern data has now been requested and cached
      expect(requested).toEqual(["3"]);
    });
  });

  describe("inserting", () => {
    it("enables the insert button once the graph has loaded", async () => {
      server.use(patternsHandler(), patternDataHandler());
      const { user } = await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      await user.click(screen.getByRole("button", { name: /Pattern 3/ }));
      await screen.findByText("3 components");

      expect(
        screen.getByRole("button", { name: "Insert pattern" }),
      ).toBeEnabled();
    });

    it("calls onInsert with the selected pattern's graph", async () => {
      const onInsert = vi.fn();
      server.use(patternsHandler(), patternDataHandler());
      const { user } = await setup(<PatternsTab onInsert={onInsert} />);
      await waitForPatterns();

      await user.click(screen.getByRole("button", { name: /Pattern 3/ }));
      await screen.findByText("3 components");

      await user.click(screen.getByRole("button", { name: "Insert pattern" }));

      expect(onInsert).toHaveBeenCalledWith(mockPatternData);
    });

    it("blocks insertion of a pattern with no components", async () => {
      server.use(patternsHandler(), patternDataHandler({ _root: {} }));
      const { user } = await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      await user.click(screen.getByRole("button", { name: /Pattern 3/ }));

      expect(
        await screen.findByText("This pattern has no components to insert."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Insert pattern" }),
      ).toBeDisabled();
    });

    it("blocks insertion if the graph fails to load", async () => {
      server.use(patternsHandler(), errorHandler("GetPatternData"));
      const { user } = await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      await user.click(screen.getByRole("button", { name: /Pattern 3/ }));

      expect(
        await screen.findByText("Couldn't load this pattern."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Insert pattern" }),
      ).toBeDisabled();
    });
  });
});
