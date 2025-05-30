import { Store } from "pages/FlowEditor/lib/store";

import { SetValue } from "./model";

type PreviousValues = string | string[] | undefined;

type HandleSetValue = (params: {
  nodeData: SetValue;
  previousValues: PreviousValues;
  passport: Store.Passport;
}) => Store.Passport;

/**
 * Handle modifying passport values when passing through a SetValue component
 * Called by computePassport()
 */
export const handleSetValue: HandleSetValue = ({
  nodeData,
  previousValues,
  passport,
}) => {
  // We do not amend values set at objects
  // These are internal exceptions we do not want to allow users to edit
  // e.g. property.boundary
  const isObject =
    typeof previousValues === "object" &&
    !Array.isArray(previousValues) &&
    previousValues !== null;
  if (isObject) return passport;

  const previous = formatPreviousValues(previousValues);

  const newValues = calculateNewValues({
    nodeData,
    previous,
    rawPrevious: previousValues,
  });

  if (newValues) {
    passport.data![nodeData.fn] = newValues;

    // Operation has cleared passport value
    if (!newValues.length) delete passport.data![nodeData.fn];
  }

  return passport;
};

type CalculateNewValues = (params: {
  nodeData: SetValue;
  previous: string[];
  rawPrevious: PreviousValues;
}) => string | string[] | undefined;

const calculateNewValues: CalculateNewValues = ({
  nodeData: { operation, val: current },
  previous,
  rawPrevious,
}) => {
  switch (operation) {
    case "replace":
      return [current];

    case "removeOne": {
      // Strings should be preserved as strings
      if (typeof rawPrevious === "string" && previous[0] !== current) {
        return previous[0];
      }

      // Single item arrays should be preserved as arrays
      if (previous.length === 1 && previous[0] !== current) {
        return previous;
      }

      const removeCurrent = (val: string) => val !== current;
      const filtered = previous.filter(removeCurrent);
      return filtered;
    }

    case "removeAll":
      return [];

    case "append": {
      const combined = [...previous, current];
      const unique = [...new Set(combined)];
      return unique;
    }
  }
};

const formatPreviousValues = (values: PreviousValues): string[] => {
  if (!values) return [];
  if (Array.isArray(values)) return values;
  return [values];
};
