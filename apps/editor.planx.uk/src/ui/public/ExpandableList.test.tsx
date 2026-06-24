import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "test/utils";
import { axe } from "vitest-axe";

import { ExpandableList, ExpandableListItem } from "./ExpandableList";

const renderItem = (props: { expanded: boolean; groupId?: string }) =>
  setup(
    <ExpandableList>
      <ExpandableListItem
        title="Section one"
        headingId="heading-1"
        groupId={props.groupId ?? "group-1-content"}
        expanded={props.expanded}
      >
        <p>Content</p>
      </ExpandableListItem>
    </ExpandableList>,
  );

describe("ExpandableListItem", () => {
  it("aria-controls references the rendered content element when expanded", async () => {
    await renderItem({ expanded: true });

    const button = screen.getByRole("button");
    const controlledId = button.getAttribute("aria-controls");
    expect(controlledId).toBe("group-1-content");
    expect(document.getElementById(controlledId!)).toBeInTheDocument();
  });

  it("normalises a groupId with spaces to a valid HTML id", async () => {
    await renderItem({ expanded: true, groupId: "group content" });

    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-controls", "group-content");
    expect(document.getElementById("group-content")).toBeInTheDocument();
  });

  it("does not render the content element when collapsed", async () => {
    await renderItem({ expanded: false });

    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("should not have any accessibility violations when expanded", async () => {
    const { container } = await renderItem({ expanded: true });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
