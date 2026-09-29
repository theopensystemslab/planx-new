import type { FlowGraph } from "@opensystemslab/planx-core/types";
import { ComponentType } from "@opensystemslab/planx-core/types";

import { validateDrawBoundary } from "./drawBoundary.js";

const buildFlow = ({
  hasSend,
  hideFileUpload,
}: {
  hasSend: boolean;
  hideFileUpload: boolean;
}): FlowGraph => ({
  _root: {
    edges: hasSend ? ["DrawBoundary", "Send"] : ["DrawBoundary"],
  },
  DrawBoundary: {
    data: { fn: "proposal.site", hideFileUpload },
    type: ComponentType.DrawBoundary,
  },
  ...(hasSend && {
    Send: {
      data: { title: "Send" },
      type: ComponentType.Send,
    },
  }),
});

test("Not applicable when there are no Draw boundary components", () => {
  const result = validateDrawBoundary({
    _root: { edges: ["Send"] },
    Send: { data: { title: "Send" }, type: ComponentType.Send },
  });

  expect(result.status).toEqual("Not applicable");
  expect(result.message).toEqual("Your flow is not using Draw boundary");
});

describe("submission services", () => {
  test("Fails when file upload is hidden", () => {
    const result = validateDrawBoundary(
      buildFlow({ hasSend: true, hideFileUpload: true }),
    );

    expect(result.status).toEqual("Fail");
    expect(result.message).toEqual(
      "In submission services, Draw boundary components cannot be set to 'Hide file upload and allow user to continue without data'.",
    );
  });

  test("Passes when file upload is not hidden", () => {
    const result = validateDrawBoundary(
      buildFlow({ hasSend: true, hideFileUpload: false }),
    );

    expect(result.status).toEqual("Pass");
  });
});

describe("non-submission services", () => {
  test("Fails when file upload is not hidden", () => {
    const result = validateDrawBoundary(
      buildFlow({ hasSend: false, hideFileUpload: false }),
    );

    expect(result.status).toEqual("Fail");
    expect(result.message).toEqual(
      "In non-submission services, Draw boundary components must be set to 'Hide file upload and allow user to continue without data'.",
    );
  });

  test("Passes when file upload is hidden", () => {
    const result = validateDrawBoundary(
      buildFlow({ hasSend: false, hideFileUpload: true }),
    );

    expect(result.status).toEqual("Pass");
  });
});
