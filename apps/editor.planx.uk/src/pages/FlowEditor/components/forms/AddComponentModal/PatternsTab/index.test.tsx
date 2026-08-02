import { screen, waitFor } from "@testing-library/react";
import { delay, graphql, HttpResponse } from "msw";
import server from "test/mockServer";
import { setup } from "test/utils";

import { PatternsTab } from ".";
import { mockPatternData, mockPatterns } from "./mocks";

const patternsHandler = (patterns = mockPatterns) =>
  graphql.query("GetPatterns", () => HttpResponse.json({ data: { patterns } }));

const errorHandler = () =>
  graphql.query("GetPatterns", () =>
    HttpResponse.json({ errors: [{ message: "Something went wrong" }] }),
  );

const waitForPatterns = () =>
  screen.findByRole("button", { name: /Pattern 1/ });

describe("PatternsTab", () => {
  describe("the pattern list", () => {
    it("renders each pattern returned by the query", async () => {
      server.use(patternsHandler());
      await setup(<PatternsTab onInsert={vi.fn()} />);

      await waitForPatterns();

      mockPatterns.forEach(({ name }) => {
        expect(
          screen.getByRole("button", { name: new RegExp(name) }),
        ).toBeInTheDocument();
      });
    });

    it("shows each pattern's component count below its name", async () => {
      server.use(patternsHandler());
      await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      expect(
        screen.getByRole("button", { name: /Pattern 3/ }),
      ).toHaveTextContent("2 components");
    });

    it("shows a loading indicator while fetching", async () => {
      server.use(
        graphql.query("GetPatterns", async () => {
          await delay(100);
          return HttpResponse.json({
            data: { patterns: mockPatterns },
          });
        }),
      );
      await setup(<PatternsTab onInsert={vi.fn()} />);

      expect(await screen.findByText("Loading patterns")).toBeInTheDocument();

      await waitForPatterns();
      expect(screen.queryByText("Loading patterns")).not.toBeInTheDocument();
    });

    it("shows an error message if the patterns query fails", async () => {
      server.use(errorHandler());
      await setup(<PatternsTab onInsert={vi.fn()} />);

      expect(
        await screen.findByText("Couldn't load patterns."),
      ).toBeInTheDocument();
    });

    it("shows an empty state when there are no patterns", async () => {
      server.use(patternsHandler([]));
      await setup(<PatternsTab onInsert={vi.fn()} />);

      expect(
        await screen.findByText("No patterns available yet."),
      ).toBeInTheDocument();
    });
  });

  describe("searching", () => {
    it("filters the list to matching patterns", async () => {
      server.use(patternsHandler());
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
      server.use(patternsHandler());
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
      server.use(patternsHandler());
      await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      expect(
        screen.getByText("Select a pattern to see details."),
      ).toBeInTheDocument();
    });

    it("shows the selected pattern's details and component count", async () => {
      server.use(patternsHandler());
      const { user } = await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      await user.click(screen.getByRole("button", { name: /Pattern 3/ }));

      // Answer nodes excluded from count; also shown in the list row itself
      expect(screen.getAllByText("2 components").length).toBeGreaterThanOrEqual(
        1,
      );
      expect(
        screen.queryByText("Select a pattern to see details."),
      ).not.toBeInTheDocument();
    });

    it("closing the panel clears the selection", async () => {
      server.use(patternsHandler());
      const { user } = await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      await user.click(screen.getByRole("button", { name: /Pattern 3/ }));

      await user.click(
        screen.getByRole("button", { name: "Close Pattern 3 details" }),
      );

      expect(
        screen.getByText("Select a pattern to see details."),
      ).toBeInTheDocument();
    });
  });

  describe("inserting", () => {
    it("enables the insert button for a pattern with components", async () => {
      server.use(patternsHandler());
      const { user } = await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      await user.click(screen.getByRole("button", { name: /Pattern 3/ }));

      expect(
        screen.getByRole("button", { name: "Insert pattern" }),
      ).toBeEnabled();
    });

    it("calls onInsert with the selected pattern's graph", async () => {
      const onInsert = vi.fn();
      server.use(patternsHandler());
      const { user } = await setup(<PatternsTab onInsert={onInsert} />);
      await waitForPatterns();

      await user.click(screen.getByRole("button", { name: /Pattern 3/ }));
      await user.click(screen.getByRole("button", { name: "Insert pattern" }));

      expect(onInsert).toHaveBeenCalledWith(mockPatternData);
    });

    it("blocks insertion of a pattern with no components", async () => {
      server.use(patternsHandler());
      const { user } = await setup(<PatternsTab onInsert={vi.fn()} />);
      await waitForPatterns();

      await user.click(screen.getByRole("button", { name: /Pattern 1/ }));

      expect(
        await screen.findByText("This pattern has no components to insert."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Insert pattern" }),
      ).toBeDisabled();
    });

    it.todo("inserts the pattern's nodes into the flow at the hanger position");
    it.todo("assigns new ids to inserted nodes, so patterns can be reused");
    it.todo("closes the modal once a pattern has been inserted");
    it.todo(
      "adds a single history entry for the whole inserted pattern, so it can be undone in one click",
    );
  });
});
