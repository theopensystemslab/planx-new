import { UserResponse } from "./model";
import {
  flatten,
  sumIdenticalUnits,
  sumIdenticalUnitsByDevelopmentType,
} from "./utils";

describe("passport data shape", () => {
  it("flattens list items", async () => {
    const defaultPassportData = {
      mockFn: [
        {
          age: 10,
          cuteness: "Very",
          email: "richard.parker@pi.com",
          name: "Richard Parker",
          size: "Medium",
        },
        {
          age: 10,
          cuteness: "Very",
          email: "richard.parker@pi.com",
          name: "Richard Parker",
          size: "Medium",
        },
      ],
    };

    expect(flatten(defaultPassportData)).toEqual({
      "mockFn.one.age": 10,
      "mockFn.one.cuteness": "Very",
      "mockFn.one.email": "richard.parker@pi.com",
      "mockFn.one.name": "Richard Parker",
      "mockFn.one.size": "Medium",
      "mockFn.two.age": 10,
      "mockFn.two.cuteness": "Very",
      "mockFn.two.email": "richard.parker@pi.com",
      "mockFn.two.name": "Richard Parker",
      "mockFn.two.size": "Medium",
    });
  });

  it("adds summary stats when applicable fields are set", async () => {
    const defaultPassportData = {
      "proposal.units.residential": [
        {
          development: "newBuild",
          garden: "Yes",
          identicalUnits: 1,
        },
        {
          development: "newBuild",
          garden: "No",
          identicalUnits: 2,
        },
        {
          development: "changeOfUseTo",
          garden: "No",
          identicalUnits: 2,
        },
      ],
    } as unknown as Record<string, UserResponse[]>;

    expect(
      sumIdenticalUnits("proposal.units.residential", defaultPassportData),
    ).toEqual(5);
    expect(
      sumIdenticalUnitsByDevelopmentType(
        "proposal.units.residential",
        defaultPassportData,
      ),
    ).toEqual({
      "proposal.units.residential.total.units.development.newBuild": 3,
      "proposal.units.residential.total.units.development.changeOfUseTo": 2,
    });
  });
});
