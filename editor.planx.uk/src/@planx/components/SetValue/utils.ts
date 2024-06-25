import { Store } from "pages/FlowEditor/lib/store";

import { SetValue } from "./model";

type PreviousValues = string | string[] | undefined;

type HandleSetValue = (params: {
  nodeData: SetValue;
  previousValues: PreviousValues;
  passport: Store.passport;
}) => Store.passport;

/**
 * Handle modifying passport values when passing through a SetValue component
 * Called by computePassport()
 */
export const handleSetValue: HandleSetValue = ({
  nodeData: { operation, fn, val: current },
  previousValues,
  passport,
}) => {
  // We do not amend values set at objects
  // These are internal exceptions we do not want to allow users to edit
  // e.g. property.boundary.title
  const isObject =
    typeof previousValues === "object" &&
    !Array.isArray(previousValues) &&
    previousValues !== null;
  if (isObject) return passport;

  const previous = formatPreviousValues(previousValues);

  const newValues = calculateNewValues({
    operation,
    previous,
    current,
  });

  if (newValues) {
    passport.data![fn] = newValues;

    // Operation has cleared passport value
    if (!newValues.length) delete passport.data![fn];
  }

  return passport;
};

type CalculateNewValues = (params: {
  operation: SetValue["operation"];
  previous: string[];
  current: string;
}) => string | string[] | undefined;

const calculateNewValues: CalculateNewValues = ({
  operation,
  previous,
  current,
}) => {
  switch (operation) {
    case "replace":
      return [current];

    case "removeOne": {
      // Do not convert output from string to string[] if operation not possible
      if (previous.length === 1 && previous[0] !== current) {
        return previous[0];
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
