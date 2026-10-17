import { flowsSearchSchema } from "./-flowsSearchSchema";

describe("flowsSearchSchema", () => {
  it("applies both sort defaults when neither param is set", () => {
    expect(flowsSearchSchema.parse({})).toMatchObject({
      sort: "last-edited",
      sortDirection: "desc",
    });
  });

  it("defaults sortDirection when only sort is set", () => {
    expect(flowsSearchSchema.parse({ sort: "last-published" })).toMatchObject({
      sort: "last-published",
      sortDirection: "desc",
    });
  });

  it("defaults sort when only sortDirection is set", () => {
    expect(flowsSearchSchema.parse({ sortDirection: "asc" })).toMatchObject({
      sort: "last-edited",
      sortDirection: "asc",
    });
  });

  it("falls back to the default for invalid values", () => {
    expect(
      flowsSearchSchema.parse({ sort: "nonexistent", sortDirection: "up" }),
    ).toMatchObject({
      sort: "last-edited",
      sortDirection: "desc",
    });
  });
});
