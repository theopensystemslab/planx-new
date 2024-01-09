import { queryMock } from "../../../../tests/graphqlQueryMock";

import {
  getSubmittedUnAnalyzedSessionIds,
  updateLowcalSessionAllowListAnswers,
} from "./operations";

jest.mock("../../../../lib/hasura/schema");
const mockFindSession = jest.fn();

jest.mock("@opensystemslab/planx-core", () => {
  const actualCoreDomainClient = jest.requireActual(
    "@opensystemslab/planx-core",
  ).CoreDomainClient;

  const actualPassport = jest.requireActual(
    "@opensystemslab/planx-core",
  ).Passport;

  return {
    Passport: actualPassport,
    CoreDomainClient: class extends actualCoreDomainClient {
      constructor() {
        super();
        this.session.find = jest
          .fn()
          .mockImplementation(() => mockFindSession());
      }
    },
  };
});

describe("getSubmittedUnAnalyzedSessionIds helper function", () => {
  test("it returns formatted session ids", async () => {
    queryMock.mockQuery({
      name: "GetSubmittedUnAnalyzedSessionIds",
      matchOnVariables: false,
      data: {
        lowcal_sessions: [{ id: "123" }, { id: "456" }, { id: "789" }],
      },
    });
    expect(await getSubmittedUnAnalyzedSessionIds()).toEqual([
      "123",
      "456",
      "789",
    ]);
  });
});

describe("updateLowcalSessionAllowListAnswers helper function", () => {
  test("it returns the updated session id", async () => {
    queryMock.mockQuery({
      name: "UpdateLowcalSessionAllowListAnswers",
      matchOnVariables: false,
      data: { id: "123" },
    });
    expect(
      await updateLowcalSessionAllowListAnswers("123", {
        "proposal.projectType": ["something"],
      }),
    ).toEqual({ id: "123" });
  });
});
