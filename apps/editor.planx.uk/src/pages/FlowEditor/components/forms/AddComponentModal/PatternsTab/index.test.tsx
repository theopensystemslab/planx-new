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
