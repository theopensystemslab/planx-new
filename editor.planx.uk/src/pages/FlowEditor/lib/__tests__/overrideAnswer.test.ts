import { vanillaStore } from "../store";

const { getState, setState } = vanillaStore;

const { overrideAnswer, currentCard, upcomingCardIds, record } = getState();

test("it clears the correct breadcrumb and navigates back to the right node", async () => {
  // set up initial state, confirm our passport computes as expected
  setState({
    flow: flowWithPropertyTypeOverride,
    breadcrumbs: propertySearchBreadcrumb,
  });
  const initialPassport = getState().computePassport();
  expect(initialPassport.data).toHaveProperty(
    ["property.type"],
    ["residential.dwelling.house.semiDetached"]
  );

  // override answer
  overrideAnswer("property.type");

  // confirm we've cleared the provided passport variable from the first node that set it
  const afterOverrideBreadcrumb = getState().breadcrumbs;
  const addressBreadcrumb: any =
    afterOverrideBreadcrumb?.["FindPropertyNodeId"]?.data;
  expect(Object.keys(addressBreadcrumb)).toHaveLength(3);
  expect(addressBreadcrumb).not.toHaveProperty(["property.type"]);

  const afterOverridePassport = getState().computePassport();
  expect(afterOverridePassport.data).toBeDefined();
  expect(afterOverridePassport.data).not.toHaveProperty(["property.type"]);

  // confirm we've stored a copy of the original value in the first node that set it
  const overrideData: any =
    afterOverrideBreadcrumb?.["FindPropertyNodeId"]?.override;
  expect(overrideData).toEqual({
    "property.type": ["residential.dwelling.house.semiDetached"],
  });

  // confirm we've navigated back to the right node, and that PropertyInformation is queued up again in upcoming cards
  expect(currentCard()?.id).toEqual("FirstPropertyTypeQuestionNodeId");
  expect(upcomingCardIds()).toContain("PropertyInformationNodeId");

  // select a new answer, confirm our passport has updated
  record("FirstPropertyTypeQuestionNodeId", {
    answers: ["FlatResponseNodeId"],
  });
  expect(upcomingCardIds()).toEqual(["PropertyInformationNodeId"]);
  expect(upcomingCardIds()).not.toContain("SecondPropertyTypeQuestionNodeId");

  const afterAnswerPassport = getState().computePassport();
  expect(afterAnswerPassport.data).toHaveProperty(
    ["property.type"],
    ["residential.dwelling.flat"]
  );
});

// mimic having completed a FindProperty search and landing on PropertyInformation
//   reminder breadcrumb order is _not_ guaranteed, eg "FirstPropertyTypeQuestionNodeId" may be last entry
const propertySearchBreadcrumb = {
  FindPropertyNodeId: {
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
        source: "os",
      },
      "property.type": ["residential.dwelling.house.semiDetached"],
      "property.localAuthorityDistrict": ["South Bucks", "Buckinghamshire"],
      "property.region": ["South East"],
    },
  },
  SecondPropertyTypeQuestionNodeId: {
    answers: ["SemiDetachedResponseNodeId"],
    auto: true,
  },
  FirstPropertyTypeQuestionNodeId: {
    answers: ["HouseResponseNodeId"],
    auto: true,
  },
};

const flowWithPropertyTypeOverride = {
  _root: {
    edges: [
      "FindPropertyNodeId",
      "FirstPropertyTypeQuestionNodeId",
      "PropertyInformationNodeId",
    ],
  },
  FlatResponseNodeId: {
    data: {
      val: "residential.dwelling.flat",
      text: "Flat",
    },
    type: 200,
  },
  FirstPropertyTypeQuestionNodeId: {
    data: {
      fn: "property.type",
      text: "What type of property is it?",
    },
    type: 100,
    edges: ["HouseResponseNodeId", "FlatResponseNodeId", "Qn8eJF7JRN"],
  },
  Qn8eJF7JRN: {
    data: {
      text: "Neither a house nor a flat",
    },
    type: 200,
  },
  FindPropertyNodeId: {
    type: 9,
  },
  PropertyInformationNodeId: {
    data: {
      title: "About the property",
      description:
        "This is the information we currently have about the property",
      showPropertyTypeOverride: true,
    },
    type: 12,
  },
  HouseResponseNodeId: {
    data: {
      val: "residential.dwelling.house",
      text: "House",
    },
    type: 200,
    edges: ["SecondPropertyTypeQuestionNodeId"],
  },
  SecondPropertyTypeQuestionNodeId: {
    type: 100,
    data: {
      fn: "property.type",
      text: "What type of house is it?",
    },
    edges: ["uKbMIB3Ou7", "SemiDetachedResponseNodeId", "X4Tq79FrNT"],
  },
  uKbMIB3Ou7: {
    type: 200,
    data: {
      text: "Detached",
      val: "residential.dwelling.house.detached",
    },
  },
  SemiDetachedResponseNodeId: {
    type: 200,
    data: {
      text: "Semi-detached",
      val: "residential.dwelling.house.semiDetached",
    },
  },
  X4Tq79FrNT: {
    type: 200,
    data: {
      text: "End terrace",
      val: "residential.dwelling.house.terrace.end",
    },
  },
};
