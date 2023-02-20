import { Store, vanillaStore } from "pages/FlowEditor/lib/store";

import { getBOPSParams } from "..";

const { getState, setState } = vanillaStore;

// https://i.imgur.com/MsCF14s.png
const flow: Store.flow = {
  _root: {
    edges: ["AbV4QmqiN5", "iIb3jctBEC"],
  },
  AbV4QmqiN5: {
    type: 140,
    data: {
      color: "#EFEFEF",
      fn: "project.photo",
      title: "project.photo",
    },
  },
  iIb3jctBEC: {
    type: 100,
    data: {
      text: "add text to the upload?",
    },
    edges: ["wPOxLLc8qI", "BHhdZowuyE", "TTOjzz2Hkr"],
  },
  wPOxLLc8qI: {
    type: 200,
    data: {
      text: "description",
    },
    edges: ["fFzoLSjOrW"],
  },
  BHhdZowuyE: {
    type: 200,
    data: {
      text: "reason",
    },
    edges: ["fP0Jou0Jg3"],
  },
  TTOjzz2Hkr: {
    type: 200,
    data: {
      text: "blank",
    },
  },
  fFzoLSjOrW: {
    type: 110,
    data: {
      fn: "project.photo.description",
      title: "project.photo.description",
    },
  },
  fP0Jou0Jg3: {
    type: 110,
    data: {
      title: "project.photo.reason",
      fn: "project.photo.reason",
    },
  },
};

const testScenarios = {
  "included when there is a *.description textinput": {
    expected: "custom description",
    breadcrumbs: {
      iIb3jctBEC: {
        auto: false,
        answers: ["wPOxLLc8qI"],
      },
      fFzoLSjOrW: {
        auto: false,
        data: {
          "project.photo.description": "custom description",
        },
      },
    },
  },
  "included when there is a *.reason textinput": {
    expected: "custom reason",
    breadcrumbs: {
      iIb3jctBEC: {
        auto: false,
        answers: ["BHhdZowuyE"],
      },
      fP0Jou0Jg3: {
        auto: false,
        data: {
          "project.photo.reason": "custom reason",
        },
      },
    },
  },
  "empty when there is no textinput": {
    expected: undefined,
    breadcrumbs: {
      iIb3jctBEC: {
        auto: false,
        answers: ["TTOjzz2Hkr"],
      },
    },
  },
};

describe("BOPS files[*].applicant_description", () => {
  Object.entries(testScenarios).forEach(
    ([name, { expected, breadcrumbs: testScenarioBreadcrumbs }]) => {
      test(`${name}`, () => {
        const { resetPreview, computePassport, sessionId } = getState();

        // Set the store's state for the test scenario
        resetPreview();
        const breadcrumbs: Store.breadcrumbs = {
          AbV4QmqiN5: {
            auto: false,
            data: {
              "project.photo": [
                {
                  url: "https://example.com/image.jpg",
                  filename: "image.jpg",
                },
                {
                  url: "https://example.com/image2.jpg",
                  filename: "image2.jpg",
                },
              ],
            },
          },
          ...testScenarioBreadcrumbs,
        };

        setState({
          flow,
          breadcrumbs,
        });

        // if the user has uploaded multiple files for a specific key,
        // ensure that every file in the list has the same description
        getBOPSParams({
          breadcrumbs,
          flow,
          passport: computePassport(),
          sessionId,
          flowName: "Apply for a lawful development certificate",
        }).files?.forEach((file) => {
          expect(file.applicant_description).toStrictEqual(expected);
        });
      });
    }
  );
});
