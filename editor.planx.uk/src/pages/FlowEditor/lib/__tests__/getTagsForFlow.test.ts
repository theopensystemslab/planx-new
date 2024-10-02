import { Store, useStore } from "../store";

const { getState, setState } = useStore;
const { getTagsForFlow } = getState();

const flow: Store.Flow = {
  _root: {
    edges: ["withTags", "withoutTags"],
  },
  withTags: {
    data: {
      tags: ["placeholder"],
      allowNegatives: false,
      title: "I have a placeholder tag",
    },
    type: 150,
  },
  withoutTags: {
    type: 8,
    data: {
      title: "No tags here!",
      color: "#EFEFEF",
      resetButton: false,
    },
  },
};

beforeAll(() => {
  setState({ flow });
});

it("returns an array of nodeIds and associated tags", () => {
  const tags = getTagsForFlow();

  expect(tags).toHaveLength(1);
  expect(tags[0].nodeId).toBe("withTags");
  expect(tags[0].tags).toEqual(expect.arrayContaining(["placeholder"]));
});
