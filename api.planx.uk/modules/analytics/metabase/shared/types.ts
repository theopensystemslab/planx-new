export interface Input {
  teamName: string;
  originalDashboardId: number;
  /** The name of the filter to be updated */
  filter: string;
  /** The value of the new filter; updateFilter() only supports strings right now */
  filterValue: string;
}

export function validateInput(input: unknown): input is Input {
  // check that input type is object
  if (typeof input !== "object" || input === null) {
    return false;
  }

  // check that input object is same shape as Input type with same properties
  const { teamName, originalDashboardId, filter, filterValue } = input as Input;

  if (typeof teamName !== "string" || teamName.trim() === "") {
    console.error("Invalid teamName: must be a non-empty string");
    return false;
  }

  if (!Number.isInteger(originalDashboardId) || originalDashboardId <= 0) {
    console.error("Invalid originalDashboardId: must be a positive integer");
    return false;
  }

  if (typeof filter !== "string" || filter.trim() === "") {
    console.error("Invalid filter: must be a non-empty string");
    return false;
  }

  if (typeof filterValue !== "string") {
    console.error("Invalid filterValue: must be a string");
    return false;
  }
  console.log("Input valid");
  return true;
}
