import { SetValue } from "./model";
import { handleSetValue } from "./utils";
import { Store } from "pages/FlowEditor/lib/store";


describe("calculateNewValues() helper function", () => {
  describe('"replace" operation', () => {
    test.each([
      { previous: undefined, expected: ["lion"] },
      { previous: "panda", expected: ["lion"] },
      { previous: "lion", expected: ["lion"] },
      { previous: ["lion"], expected: ["lion"] },
      { previous: ["bear", "dog", "monkey"], expected: ["lion"] },
      { previous: ["bear", "dog", "lion"], expected: ["lion"] },
    ])('input of $previous sets passport value to be $expected', ({ previous, expected }) => {
      const mockKey = "myAnimals";
      const mockSetValue: SetValue = {
        operation: "replace",
        fn: mockKey,
        val: "lion",
      };
      const mockPassport: Store.passport = {
        data: { mockNode: mockSetValue, [mockKey]: previous },
      };

      const updatedPassport = handleSetValue({
        nodeData: mockSetValue,
        previousValues: previous,
        passport: mockPassport,
      });

      const actual = updatedPassport.data?.[mockKey];
      expect(actual).toEqual(expected);
    });
  });

  describe('"append" operation', () => {
    test.each([
      { previous: undefined, expected: ["lion"] },
      { previous: "panda", expected: ["panda", "lion"] },
      { previous: "lion", expected: ["lion"] },
      { previous: ["lion"], expected: ["lion"] },
      {
        previous: ["bear", "dog", "monkey"],
        expected: ["bear", "dog", "monkey", "lion"],
      },
      { previous: ["bear", "dog", "lion"], expected: ["bear", "dog", "lion"] },
    ])('input of $previous sets passport value to be $expected', ({ previous, expected }) => {
      const mockKey = "myAnimals";
      const mockSetValue: SetValue = {
        operation: "append",
        fn: mockKey,
        val: "lion",
      };
      const mockPassport: Store.passport = {
        data: { mockNode: mockSetValue, [mockKey]: previous },
      };

      const updatedPassport = handleSetValue({
        nodeData: mockSetValue,
        previousValues: previous,
        passport: mockPassport,
      });

      const actual = updatedPassport.data?.[mockKey];
      expect(actual).toEqual(expected);
    });
  });

  describe('"removeOne" operation', () => {
    test.each([
      { previous: undefined, expected: undefined },
      { previous: "panda", expected: "panda" },
      { previous: "lion", expected: undefined },
      { previous: ["lion"], expected: undefined },
      {
        previous: ["bear", "dog", "monkey"],
        expected: ["bear", "dog", "monkey"],
      },
      { previous: ["bear", "dog", "lion"], expected: ["bear", "dog"] },
    ])('input of $previous sets passport value to be $expected', ({ previous, expected }) => {
      const mockKey = "myAnimals";
      const mockSetValue: SetValue = {
        operation: "removeOne",
        fn: mockKey,
        val: "lion",
      };
      const mockPassport: Store.passport = {
        data: { mockNode: mockSetValue, [mockKey]: previous },
      };

      const updatedPassport = handleSetValue({
        nodeData: mockSetValue,
        previousValues: previous,
        passport: mockPassport,
      });

      const actual = updatedPassport.data?.[mockKey];
      expect(actual).toEqual(expected);
    });
  });

  describe('"removeAll" operation', () => {
    test.each([
      { previous: undefined, expected: undefined },
      { previous: "panda", expected: undefined },
      { previous: "lion", expected: undefined },
      { previous: ["lion"], expected: undefined },
      {
        previous: ["bear", "dog", "monkey"],
        expected: undefined,
      },
      { previous: ["bear", "dog", "lion"], expected: undefined },
    ])('input of $previous sets passport value to be $expected', ({ previous, expected }) => {
      const mockKey = "myAnimals";
      const mockSetValue: SetValue = {
        operation: "removeAll",
        fn: mockKey,
        val: "lion",
      };
      const mockPassport: Store.passport = {
        data: { mockNode: mockSetValue, [mockKey]: previous },
      };

      const updatedPassport = handleSetValue({
        nodeData: mockSetValue,
        previousValues: previous,
        passport: mockPassport,
      });

      const actual = updatedPassport.data?.[mockKey];
      expect(actual).toEqual(expected);
    });
  });
});
