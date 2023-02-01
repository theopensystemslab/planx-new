import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

const { overrideAnswer, currentCard } = getState();

test("it clears the correct breadcrumb and navigates back to the right node", async () => {
  setState({
    flow: flowWithPropertyTypeOverride,
    breadcrumbs: propertySearchBreadcrumb,
  });

  overrideAnswer("property.type");

  // confirm we've cleared the provided passport variable from the first node that set it
  const afterOverrideBreadcrumb = getState().breadcrumbs;
  const addressData: any = afterOverrideBreadcrumb?.["ZcIDY8Ak5t"]?.data;
  expect(Object.keys(addressData)).toHaveLength(3);
  expect(Object.keys(addressData)).not.toContain("property.type");

  // confirm we've navigated back to the right node
  expect(currentCard()?.id).toEqual("IuTOXkwbGk");
});

// mimic having completed a property search and landing on PropertyInformation
const propertySearchBreadcrumb = {
  ZcIDY8Ak5t: {
    auto: false,
    data: {
      _address: {
        uprn: "100081281679",
        blpu_code: "2",
        latitude: 51.5554587,
        longitude: -0.4850374,
        organisation: null,
        pao: "6",
        street: "WILLOW CRESCENT EAST",
        town: "NEW DENHAM",
        postcode: "UB9 4AP",
        x: 505127,
        y: 185151,
        planx_description: "Semi-detached",
        planx_value: "residential.dwelling.house.semiDetached",
        single_line_address:
          "6, WILLOW CRESCENT EAST, NEW DENHAM, BUCKINGHAMSHIRE, UB9 4AP",
        title: "6, WILLOW CRESCENT EAST, NEW DENHAM",
      },
      "property.type": ["residential.dwelling.house.semiDetached"],
      "property.localAuthorityDistrict": ["South Bucks", "Buckinghamshire"],
      "property.region": ["South East"],
    },
  },
  IuTOXkwbGk: {
    answers: ["mZGNiRT2bc"],
    auto: true,
  },
};

const flowWithPropertyTypeOverride = {
  _root: {
    edges: ["ZcIDY8Ak5t", "IuTOXkwbGk", "ju7Lg0BgJ0"],
  },
  ZcIDY8Ak5t: {
    type: 9,
  },
  ju7Lg0BgJ0: {
    type: 12,
    data: {
      title: "About the property",
      description:
        "This is the information we currently have about the property",
      showPropertyTypeOverride: true,
    },
  },
  IuTOXkwbGk: {
    type: 100,
    data: {
      fn: "property.type",
      text: "What type of property is it?",
    },
    edges: ["mZGNiRT2bc", "5tAEd1U7jb", "Qn8eJF7JRN"],
  },
  mZGNiRT2bc: {
    type: 200,
    data: {
      text: "House",
      val: "residential.dwelling.house",
    },
  },
  "5tAEd1U7jb": {
    type: 200,
    data: {
      text: "Flat",
      val: "residential.dwelling.flat",
    },
  },
  Qn8eJF7JRN: {
    type: 200,
    data: {
      text: "Neither a house nor a flat",
    },
  },
};
