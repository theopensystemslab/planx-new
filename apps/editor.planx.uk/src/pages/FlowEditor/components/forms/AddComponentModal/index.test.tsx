import { screen, waitFor } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";
import { setup } from "test/utils";
import { vi } from "vitest";

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ team: "test-team", flow: "test-flow" }),
  };
});

import AddComponentModal from ".";
import { mockPatternData, mockPatterns } from "./PatternsTab/mocks";

const patternsHandler = () =>
  graphql.query("GetPatterns", () =>
    HttpResponse.json({ data: { patterns: mockPatterns } }),
  );

const patternDataHandler = () =>
  graphql.query("GetPatternData", ({ variables }) =>
    HttpResponse.json({
      data: { pattern: { id: variables.id, data: mockPatternData } },
    }),
  );

describe("AddComponentModal", () => {
  describe("handleInsertPattern", () => {
    it.skip("calls insertPattern on the store then closes the modal", async () => {
      const insertPattern = vi.fn();
      useStore.setState({ insertPattern });

      const onClose = vi.fn();
      const anchor = document.createElement("div");
      document.body.appendChild(anchor);

      server.use(patternsHandler(), patternDataHandler());

      const { user } = await setup(
        <AddComponentModal
          anchorEl={anchor}
          parent="parent-node"
          before="before-node"
          onClose={onClose}
        />,
      );

      await user.click(screen.getByRole("tab", { name: /Patterns/ }));
      const patternButton = await screen.findByRole("button", {
        name: /Pattern 3/,
      });

      await user.hover(patternButton);
      await screen.findByText("2 components");

      await user.click(patternButton);

      await waitFor(() => {
        expect(insertPattern).toHaveBeenCalledWith(
          mockPatternData,
          "parent-node",
          "before-node",
        );
        expect(onClose).toHaveBeenCalled();
      });

      document.body.removeChild(anchor);
    });
  });
});
