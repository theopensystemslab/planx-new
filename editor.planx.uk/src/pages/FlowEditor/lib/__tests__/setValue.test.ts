import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { cloneDeep, merge } from "lodash";

import { Store, vanillaStore } from "../store";

const { getState, setState } = vanillaStore;
const { resetPreview, record, computePassport, currentCard } = getState();

const baseFlow: Store.flow = {
  _root: {
    edges: ["setValue1", "middleOfService", "setValue2", "endOfService"],
  },
  setValue1: {
    data: {
      fn: "myKey",
      val: "myFirstValue",
      operation: null,
    },
    type: TYPES.SetValue,
  },
  middleOfService: {
    type: TYPES.Notice,
    data: {
      title: "Middle of service",
      color: "#EFEFEF",
      resetButton: false,
    },
  },
  setValue2: {
    data: {
      fn: "myKey",
      val: "mySecondValue",
      operation: null,
    },
    type: TYPES.SetValue,
  },
  endOfService: {
    type: TYPES.Notice,
    data: {
      title: "End of service",
      color: "#EFEFEF",
      resetButton: true,
    },
  },
};

describe("SetValue component", () => {
  describe("replace operation", () => {
    const replaceFlow = merge(cloneDeep(baseFlow), {
      setValue1: {
        data: {
          operation: "replace",
        },
      },
      setValue2: {
        data: {
          operation: "replace",
        },
      },
    });

    beforeEach(() => {
      resetPreview();
      setState({ flow: replaceFlow });
    });

    it("sets a value if not previously set", () => {
      // Value not set
      expect(computePassport()?.data?.myKey1).not.toBeDefined();

      // Step through first SetValue
      record("setValue1", { data: { myKey1: ["myFirstValue"] } });

      // SetValue is visited
      const breadcrumbKeys = Object.keys(getState().breadcrumbs);
      expect(breadcrumbKeys).toContain("setValue1");

      // Middle of flow reached
      expect(currentCard()?.id).toEqual("middleOfService");

      // Passport correctly populated
      expect(computePassport()?.data?.myKey1).toHaveLength(1);
      expect(computePassport()?.data?.myKey1).toContain("myFirstValue");
    });

    it("replaces an existing value", () => {
      // Step through second SetValue
      record("setValue1", { data: { myKey1: ["myFirstValue"] } });
      record("middleOfService", {});
      record("setValue2", { data: { myKey1: ["mySecondValue"] } });

      // Second SetValue is visited
      const breadcrumbKeys = Object.keys(getState().breadcrumbs);
      expect(breadcrumbKeys).toContain("setValue2");

      // End of flow reached
      expect(currentCard()?.id).toEqual("endOfService");

      // Passport correctly populated
      expect(computePassport()?.data?.myKey1).toHaveLength(1);
      expect(computePassport()?.data?.myKey1).toContain("mySecondValue");
    });
  });

  describe("append operation", () => {
    const appendFlow = merge(cloneDeep(baseFlow), {
      setValue1: {
        data: {
          operation: "append",
        },
      },
      setValue2: {
        data: {
          operation: "append",
        },
      },
    });

    beforeEach(() => {
      resetPreview();
      setState({ flow: appendFlow });
    });

    it("sets a value if not previously set", () => {
      // Value not set
      expect(computePassport()?.data?.myKey1).not.toBeDefined();

      // Step through first SetValue
      record("setValue1", { data: { myKey1: ["myFirstValue"] } });

      // SetValue is visited
      const breadcrumbKeys = Object.keys(getState().breadcrumbs);
      expect(breadcrumbKeys).toContain("setValue1");

      // Middle of flow reached
      expect(currentCard()?.id).toEqual("middleOfService");

      // Passport correctly populated
      expect(computePassport()?.data?.myKey1).toHaveLength(1);
      expect(computePassport()?.data?.myKey1).toContain("myFirstValue");
    });

    it("appends to an existing value", () => {
      // Step through second SetValue
      record("setValue1", { data: { myKey: ["myFirstValue"] } });
      record("middleOfService", {});

      expect(computePassport()?.data?.myKey).toHaveLength(1);
      expect(computePassport()?.data?.myKey).toContain("myFirstValue");

      record("setValue2", { data: { myKey: ["mySecondValue"] } });

      // Second SetValue is visited
      const breadcrumbKeys = Object.keys(getState().breadcrumbs);
      expect(breadcrumbKeys).toContain("setValue2");

      // End of flow reached
      expect(currentCard()?.id).toEqual("endOfService");

      // Passport correctly populated
      expect(computePassport()?.data?.myKey).toHaveLength(2);
      expect(computePassport()?.data?.myKey).toContain("myFirstValue");
      expect(computePassport()?.data?.myKey).toContain("mySecondValue");
    });
  });

  describe("remove operation", () => {
    const removeFlow = merge(cloneDeep(baseFlow), {
      _root: {
        edges: [
          "setValue1",
          "middleOfService",
          "setValue2",
          "setValue3",
          "endOfService",
        ],
      },
      setValue1: {
        data: {
          operation: "remove",
        },
      },
      setValue2: {
        data: {
          operation: "replace",
        },
      },
      setValue3: {
        data: {
          fn: "myKey",
          // TODO: Do we need a val for remove?
          val: "myFirstValue",
          operation: "remove",
        },
        type: TYPES.SetValue,
      },
    });

    beforeEach(() => {
      resetPreview();
      setState({ flow: removeFlow });
    });

    it("does nothing if a value is not previously set", () => {
      // Value not set
      expect(computePassport()?.data?.myKey).not.toBeDefined();

      // Step through first SetValue
      record("setValue1", { data: { myKey: ["myFirstValue"] } });

      // SetValue is visited
      const breadcrumbKeys = Object.keys(getState().breadcrumbs);
      expect(breadcrumbKeys).toContain("setValue1");

      // Middle of flow reached
      expect(currentCard()?.id).toEqual("middleOfService");

      // Passport correctly populated - value not present
      expect(computePassport()?.data?.myKey).toBeUndefined();
    });

    it("removed a previously set value", () => {
      // Step through second SetValue
      record("setValue1", { data: { myKey: ["myFirstValue"] } });
      record("middleOfService", {});
      record("setValue2", { data: { myKey: ["mySecondValue"] } });

      // Second SetValue is visited
      const breadcrumbKeys = Object.keys(getState().breadcrumbs);
      expect(breadcrumbKeys).toContain("setValue2");

      // Value is set by "replace" operation
      expect(computePassport()?.data?.myKey).toHaveLength(1);
      expect(computePassport()?.data?.myKey).toContain("mySecondValue");

      // Step through final SetValue component
      record("setValue3", { data: { myKey: ["myFirstValue"] } });

      // End of flow reached
      expect(currentCard()?.id).toEqual("endOfService");

      // Passport correctly populated - value no longer set
      expect(computePassport()?.data?.myKey).toBeUndefined();
    });
  });
});