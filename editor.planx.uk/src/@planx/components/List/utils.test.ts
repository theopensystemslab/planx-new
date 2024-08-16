import { UserResponse } from "./../shared/Schema/model";
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
          "cuteness.amount": "Very",
          "email.address": "richard.parker@pi.com",
          name: "Richard Parker",
          size: "Medium",
          food: ["bamboo", "leaves"],
        },
        {
          age: 10,
          "cuteness.amount": "Very",
          "email.address": "richard.parker@pi.com",
          name: "Richard Parker",
          size: "Medium",
          food: ["meat", "bamboo", "leaves"],
        },
      ],
    };

    expect(flatten(defaultPassportData, { depth: 2 })).toEqual({
      "mockFn.one.age": 10,
      "mockFn.one.cuteness.amount": "Very",
      "mockFn.one.email.address": "richard.parker@pi.com",
      "mockFn.one.name": "Richard Parker",
      "mockFn.one.size": "Medium",
      "mockFn.one.food": ["bamboo", "leaves"],
      "mockFn.two.age": 10,
      "mockFn.two.cuteness.amount": "Very",
      "mockFn.two.email.address": "richard.parker@pi.com",
      "mockFn.two.name": "Richard Parker",
      "mockFn.two.size": "Medium",
      "mockFn.two.food": ["meat", "bamboo", "leaves"],
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
