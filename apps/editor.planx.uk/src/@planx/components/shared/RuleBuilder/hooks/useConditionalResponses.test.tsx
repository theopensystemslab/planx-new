import { ConditionalOption } from "@planx/components/Option/model";
import { renderHook } from "@testing-library/react";
import { logger } from "airbrake";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";

import type { Group } from "../../BaseChecklist/model";
import { Condition, Operator } from "../types";
import { useConditionalOptions } from "./useConditionalResponses";

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

describe("options", () => {
  describe("simple rules (Condition.AlwaysRequired)", () => {
    it("returns all responses", () => {
      const input: ConditionalOption[] = [
        {
          id: "response-1",
          data: {
            text: "Dog",
            rule: { condition: Condition.AlwaysRecommended },
          },
        },
        {
          id: "response-2",
          data: {
            text: "Cat",
            rule: { condition: Condition.AlwaysRequired },
          },
        },
        {
          id: "response-3",
          data: {
            text: "Budgie",
            rule: { condition: Condition.NotRequired },
          },
        },
      ];

      const { result } = renderHook(() => useConditionalOptions(input));

      expect(result.current.conditionalOptions).toMatchObject(input);
    });
  });

  describe("condition rules (Condition.RequiredIf)", () => {
    const responsesWithConditions: ConditionalOption[] = [
      {
        id: "response-1",
        data: {
          text: "Dog",
          rule: {
            condition: Condition.RequiredIf,
            operator: Operator.Equals,
            fn: "pet",
            val: "size.large",
          },
        },
      },
      {
        id: "response-2",
        data: {
          text: "Cat",
          rule: {
            condition: Condition.RequiredIf,
            operator: Operator.Equals,
            fn: "pet",
            val: "size.medium",
          },
        },
      },
      {
        id: "response-3",
        data: {
          text: "Budgie",
          rule: {
            condition: Condition.RequiredIf,
            operator: Operator.Equals,
            fn: "pet",
            val: "size.small",
          },
        },
      },
    ];

    it("returns all responses if the all rules are met", () => {
      // User has answered previous questions so that all responses should be displayed
      mockUseStore({
        data: { pet: ["size.small.cute", "size.medium", "size.large.cuddly"] },
      });

      const { result } = renderHook(() =>
        useConditionalOptions(responsesWithConditions),
      );

      // All responses displayed
      expect(result.current.conditionalOptions).toMatchObject(
        responsesWithConditions,
      );
    });

    it("returns some responses if the some of the rules are met", () => {
      // User has answered previous questions so that only some responses should be displayed
      mockUseStore({ data: { pet: "size.small" } });

      const { result } = renderHook(() =>
        useConditionalOptions(responsesWithConditions),
      );

      // Only matching responses displayed
      expect(result.current.conditionalOptions).toHaveLength(1);
      expect(result.current.conditionalOptions?.[0].data.text).toEqual(
        "Budgie",
      );
    });

    it("filters out responses if the rules are not met", () => {
      // User has answered previous questions so that no responses should be displayed
      mockUseStore();
      const loggerSpy = vi.spyOn(logger, "notify");

      const { result } = renderHook(() =>
        useConditionalOptions(responsesWithConditions),
      );

      // No responses displayed
      expect(result.current.conditionalOptions).toBeUndefined();
      expect(loggerSpy).toHaveBeenCalled();
    });
  });
});

describe("grouped options", () => {
  describe("simple rules (Condition.AlwaysRequired)", () => {
    it("returns all responses, and all groups", () => {
      const input: Group<ConditionalOption>[] = [
        {
          title: "Pets",
          children: [
            {
              id: "response-1",
              data: {
                text: "Dog",
                rule: { condition: Condition.AlwaysRecommended },
              },
            },
            {
              id: "response-2",
              data: {
                text: "Cat",
                rule: { condition: Condition.AlwaysRequired },
              },
            },
            {
              id: "response-3",
              data: {
                text: "Budgie",
                rule: { condition: Condition.NotRequired },
              },
            },
          ],
        },
        {
          title: "Zoo Animals",
          children: [
            {
              id: "response-4",
              data: {
                text: "Panda",
                rule: { condition: Condition.AlwaysRecommended },
              },
            },
            {
              id: "response-5",
              data: {
                text: "Elephant",
                rule: { condition: Condition.AlwaysRequired },
              },
            },
            {
              id: "response-6",
              data: {
                text: "Giraffe",
                rule: { condition: Condition.NotRequired },
              },
            },
          ],
        },
      ];

      const { result } = renderHook(() =>
        useConditionalOptions(undefined, input),
      );

      expect(result.current.groupedConditionalOptions).toMatchObject(input);
    });
  });

  describe("condition rules (Condition.RequiredIf)", () => {
    const groupedResponsesWithConditions: Group<ConditionalOption>[] = [
      {
        title: "Pets",
        children: [
          {
            id: "response-1",
            data: {
              text: "Dog",
              rule: {
                condition: Condition.RequiredIf,
                operator: Operator.Equals,
                fn: "pet",
                val: "size.large",
              },
            },
          },
          {
            id: "response-2",
            data: {
              text: "Cat",
              rule: {
                condition: Condition.RequiredIf,
                operator: Operator.Equals,
                fn: "pet",
                val: "size.medium",
              },
            },
          },
          {
            id: "response-3",
            data: {
              text: "Budgie",
              rule: {
                condition: Condition.RequiredIf,
                operator: Operator.Equals,
                fn: "pet",
                val: "size.small",
              },
            },
          },
        ],
      },
      {
        title: "Small Zoo Animals",
        children: [
          {
            id: "response-4",
            data: {
              text: "Meerkat",
              rule: {
                condition: Condition.RequiredIf,
                operator: Operator.Equals,
                fn: "zoo",
                val: "size.small",
              },
            },
          },
        ],
      },
      {
        title: "Large Zoo Animals",
        children: [
          {
            id: "response-5",
            data: {
              text: "Elephant",
              rule: {
                condition: Condition.RequiredIf,
                operator: Operator.Equals,
                fn: "zoo",
                val: "size.xl",
              },
            },
          },
          {
            id: "response-6",
            data: {
              text: "Giraffe",
              rule: {
                condition: Condition.RequiredIf,
                operator: Operator.Equals,
                fn: "zoo",
                val: "size.xl",
              },
            },
          },
        ],
      },
    ];

    it("returns all responses if the all rules are met", () => {
      // User has answered previous questions so that all responses should be displayed
      mockUseStore({
        data: {
          pet: ["size.small.cute", "size.medium", "size.large.cuddly"],
          zoo: [
            "size.small.photogenic",
            "size.medium",
            "size.large.curious",
            "size.xl",
          ],
        },
      });

      const { result } = renderHook(() =>
        useConditionalOptions(undefined, groupedResponsesWithConditions),
      );

      // All responses displayed
      expect(result.current.groupedConditionalOptions).toMatchObject(
        groupedResponsesWithConditions,
      );
    });

    it("returns some responses if the some of the rules are met", () => {
      // User has answered previous questions so that only some responses should be displayed
      mockUseStore({
        data: {
          pet: "size.small",
          zoo: "size.small",
        },
      });

      const { result } = renderHook(() =>
        useConditionalOptions(undefined, groupedResponsesWithConditions),
      );

      // Only matching responses displayed
      // Empty groups filtered out
      expect(result.current.groupedConditionalOptions).toHaveLength(2);
      expect(
        result.current.groupedConditionalOptions?.[0].children[0].data.text,
      ).toEqual("Budgie");
      expect(
        result.current.groupedConditionalOptions?.[1].children[0].data.text,
      ).toEqual("Meerkat");
    });

    it("filters out responses if the rules are not met", () => {
      // User has answered previous questions so that no responses should be displayed
      mockUseStore();
      const loggerSpy = vi.spyOn(logger, "notify");

      const { result } = renderHook(() =>
        useConditionalOptions(undefined, groupedResponsesWithConditions),
      );

      // No responses displayed
      expect(result.current.groupedConditionalOptions).toBeUndefined();
      expect(loggerSpy).toHaveBeenCalled();
    });
  });
});
