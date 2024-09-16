import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { cloneDeep, merge } from "lodash";

import { Store, useStore } from "../store";

const { getState, setState } = useStore;
const { resetPreview, record, computePassport, getCurrentCard } = getState();

const baseFlow: Store.Flow = {
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
      expect(computePassport()?.data?.myKey).not.toBeDefined();

      // Step through first SetValue
      record("setValue1", { data: { myKey: ["myFirstValue"] } });

      // SetValue is visited
      const breadcrumbKeys = Object.keys(getState().breadcrumbs);
      expect(breadcrumbKeys).toContain("setValue1");

      // Middle of flow reached
      expect(getCurrentCard()?.id).toEqual("middleOfService");

      // Passport correctly populated
      expect(computePassport()?.data?.myKey).toHaveLength(1);
      expect(computePassport()?.data?.myKey).toContain("myFirstValue");
    });

    it("replaces an existing value", () => {
      // Step through second SetValue
      record("setValue1", { data: { myKey: ["myFirstValue"] } });
      record("middleOfService", {});
      record("setValue2", { data: { myKey: ["mySecondValue"] } });

      // Second SetValue is visited
      const breadcrumbKeys = Object.keys(getState().breadcrumbs);
      expect(breadcrumbKeys).toContain("setValue2");

      // End of flow reached
      expect(getCurrentCard()?.id).toEqual("endOfService");

      // Passport correctly populated
      expect(computePassport()?.data?.myKey).toHaveLength(1);
      expect(computePassport()?.data?.myKey).toContain("mySecondValue");
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
      expect(computePassport()?.data?.myKey).not.toBeDefined();

      // Step through first SetValue
      record("setValue1", { data: { myKey: ["myFirstValue"] } });

      // SetValue is visited
      const breadcrumbKeys = Object.keys(getState().breadcrumbs);
      expect(breadcrumbKeys).toContain("setValue1");

      // Middle of flow reached
      expect(getCurrentCard()?.id).toEqual("middleOfService");

      // Passport correctly populated
      expect(computePassport()?.data?.myKey).toHaveLength(1);
      expect(computePassport()?.data?.myKey).toContain("myFirstValue");
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
      expect(getCurrentCard()?.id).toEqual("endOfService");

      // Passport correctly populated
      expect(computePassport()?.data?.myKey).toHaveLength(2);
      expect(computePassport()?.data?.myKey).toContain("myFirstValue");
      expect(computePassport()?.data?.myKey).toContain("mySecondValue");
    });
  });

  describe("removeOne operation", () => {
    const removeOneFlow = merge(cloneDeep(baseFlow), {
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
          operation: "removeOne",
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
          val: "mySecondValue",
          operation: "removeOne",
        },
        type: TYPES.SetValue,
      },
    });

    beforeEach(() => {
      resetPreview();
      setState({ flow: removeOneFlow });
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
      expect(getCurrentCard()?.id).toEqual("middleOfService");

      // Passport correctly populated - value not present
      expect(computePassport()?.data?.myKey).toBeUndefined();
    });

    it("removes a passport variable when the value matches", () => {
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
      record("setValue3", { data: { myKey: ["mySecondValue"] } });

      // End of flow reached
      expect(getCurrentCard()?.id).toEqual("endOfService");

      // Passport correctly populated - value no longer set
      expect(computePassport()?.data?.myKey).toBeUndefined();
    });

    it("does not remove a passport variable when the value does not match", () => {
      const flowWithMismatchedValue = merge(cloneDeep(removeOneFlow), {
        setValue3: {
          data: {
            fn: "myKey",
            // Value not present, will not be removed
            val: "myUnsetValue",
            operation: "removeOne",
          },
          type: TYPES.SetValue,
        },
      });

      resetPreview();
      setState({ flow: flowWithMismatchedValue });

      // Step through flow
      record("setValue1", { data: { myKey: ["myFirstValue"] } });
      record("middleOfService", {});
      record("setValue2", { data: { myKey: ["mySecondValue"] } });
      record("setValue3", { data: { myKey: ["myUnsetValue"] } });

      // End of flow reached
      expect(getCurrentCard()?.id).toEqual("endOfService");

      // Passport correctly populated - passport variable not removed as values do not match
      expect(computePassport()?.data?.myKey).toEqual("mySecondValue");
    });
  });

  describe("removeAll operation", () => {
    const removeAllFlow = merge(cloneDeep(baseFlow), {
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
          operation: "removeAll",
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
          val: "mySecondValue",
          operation: "removeAll",
        },
        type: TYPES.SetValue,
      },
    });

    beforeEach(() => {
      resetPreview();
      setState({ flow: removeAllFlow });
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
      expect(getCurrentCard()?.id).toEqual("middleOfService");

      // Passport correctly populated - value not present
      expect(computePassport()?.data?.myKey).toBeUndefined();
    });

    it("removes a passport variable", () => {
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
      record("setValue3", { data: { myKey: ["mySecondValue"] } });

      // End of flow reached
      expect(getCurrentCard()?.id).toEqual("endOfService");

      // Passport correctly populated - key:value pair removed
      expect(computePassport()?.data).not.toHaveProperty("myKey");
    });
  });
});
