import { renderHook } from "@testing-library/react";
import { logger } from "airbrake";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";

import { Response } from "../..";
import { Condition, Operator } from "../types";
import { useConditionalResponses } from "./useConditionalResponses";

vi.mock("pages/FlowEditor/lib/store");

const mockUseStore = (passportData = {}) => {
  const mockComputePassport = vi.fn(() => passportData);
  const mockGetState = vi.fn(
    () =>
      ({
        computePassport: mockComputePassport,
      }) as unknown as FullStore,
  );

  vi.mocked(useStore).mockImplementation((selector) =>
    selector({
      computePassport: mockComputePassport,
    } as unknown as FullStore),
  );

  vi.mocked(useStore).getState = mockGetState;
};

vi.mock("airbrake", () => ({
  logger: {
    notify: vi.fn(),
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe("no rules", () => {
  it("returns all responses", () => {
    const input: Response[] = [
      {
        id: "response-1",
        responseKey: 1,
        text: "Dog",
      },
      {
        id: "response-2",
        responseKey: 2,
        text: "Cat",
      },
      {
        id: "response-3",
        responseKey: 3,
        text: "Budgee",
      },
      {
        id: "response-4",
        responseKey: 4,
        text: "Goldfish",
      },
      {
        id: "response-5",
        responseKey: 5,
        text: "Hamster",
      },
    ];

    const { result } = renderHook(() => useConditionalResponses(input));

    expect(result.current).toMatchObject(input);
  });
});

describe("simple rules (Condition.AlwaysRequired)", () => {
  it("returns all responses", () => {
    const input: Response[] = [
      {
        id: "response-1",
        responseKey: 1,
        text: "Dog",
        rule: { condition: Condition.AlwaysRecommended },
      },
      {
        id: "response-2",
        responseKey: 2,
        text: "Cat",
        rule: { condition: Condition.AlwaysRequired },
      },
      {
        id: "response-3",
        responseKey: 3,
        text: "Budgee",
        rule: { condition: Condition.NotRequired },
      },
    ];

    const { result } = renderHook(() => useConditionalResponses(input));

    expect(result.current).toMatchObject(input);
  });
});

describe("condition rules (Condition.RequiredIf)", () => {
  const responsesWithConditions: Response[] = [
    {
      id: "response-1",
      responseKey: 1,
      text: "Dog",
      rule: {
        condition: Condition.RequiredIf,
        operator: Operator.Equals,
        fn: "pet",
        val: "size.large",
      },
    },
    {
      id: "response-2",
      responseKey: 2,
      text: "Cat",
      rule: {
        condition: Condition.RequiredIf,
        operator: Operator.Equals,
        fn: "pet",
        val: "size.medium",
      },
    },
    {
      id: "response-3",
      responseKey: 3,
      text: "Budgee",
      rule: {
        condition: Condition.RequiredIf,
        operator: Operator.Equals,
        fn: "pet",
        val: "size.small",
      },
    },
  ];

  it("returns all responses if the all rules are met", () => {
    // User has answered previous questions so that all responses should be displayed
    mockUseStore({
      data: { pet: ["size.small.cute", "size.medium", "size.large.cuddly"] },
    });

    const { result } = renderHook(() =>
      useConditionalResponses(responsesWithConditions),
    );

    // All responses displayed
    expect(result.current).toMatchObject(responsesWithConditions);
  });

  it("returns some responses if the some of the rules are met", () => {
    // User has answered previous questions so that only some responses should be displayed
    mockUseStore({ data: { pet: "size.small" } });

    const { result } = renderHook(() =>
      useConditionalResponses(responsesWithConditions),
    );

    // Only matching responses displayed
    expect(result.current).toHaveLength(1);
    expect(result.current[0].text).toEqual("Budgee");
  });

  it("filters out responses if the rules are not met", () => {
    // User has answered previous questions so that no responses should be displayed
    mockUseStore();
    const loggerSpy = vi.spyOn(logger, "notify");

    const { result } = renderHook(() =>
      useConditionalResponses(responsesWithConditions),
    );

    // No responses displayed
    expect(result.current).toHaveLength(0);
    expect(loggerSpy).toHaveBeenCalled();
  });
});
