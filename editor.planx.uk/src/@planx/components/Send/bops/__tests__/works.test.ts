import { getBOPSParams } from "..";

test("Start date is set in the payload when present in passport", () => {
  const result = getBOPSParams({
    breadcrumbs: {},
    flow: {},
    passport: {
      data: {
        "proposal.start.date": "2025-02-03",
      },
    },
    sessionId: "session-123",
    flowName: "Apply for a lawful development certificate",
  });
  expect(result.works?.start_date).toEqual("2025-02-03");
});

test("Start date is not set in the payload when not present in passport", () => {
  const result = getBOPSParams({
    breadcrumbs: {},
    flow: {},
    passport: {},
    sessionId: "session-123",
    flowName: "Apply for a lawful development certificate",
  });
  expect(result).not.toHaveProperty("works");
});

test("Completion date is set in the payload when present in passport", () => {
  const result = getBOPSParams({
    breadcrumbs: {},
    flow: {},
    passport: {
      data: {
        "proposal.completion.date": "2025-02-03",
      },
    },
    sessionId: "session-123",
    flowName: "Apply for a lawful development certificate",
  });
  expect(result.works?.finish_date).toEqual("2025-02-03");
});

test("Completion date is not set in the payload when not present in passport", () => {
  const result = getBOPSParams({
    breadcrumbs: {},
    flow: {},
    passport: {},
    sessionId: "session-123",
    flowName: "Apply for a lawful development certificate",
  });
  expect(result).not.toHaveProperty("works");
});
