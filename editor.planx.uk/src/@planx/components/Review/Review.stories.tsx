import { Meta, StoryFn } from "@storybook/react";
import React from "react";

import Presentational from "./Public/Presentational";

const metadata: Meta = {
  title: "PlanX Components/Review",
  component: Presentational,
  argTypes: {
    handleSubmit: { control: { disable: true }, action: true },
  },
};

const passport = {
  data: {
    "property.constraints.planning": {
      value: ["designated.conservationArea", "listed"],
    },
  },
  info: {
    UPRN: 200003453482,
    team: "southwark",
    organisation: null,
    sao: null,
    pao: "51",
    street: "COBOURG ROAD",
    town: "LONDON",
    postcode: "SE5 0HU",
    blpu_code: "RD04",
    planx_description: "Terrace",
    planx_value: "residential.dwelling.house.terrace",
    x: 533674,
    y: 178069,
  },
};

const breadcrumbs = {
  "5uGRLrUdF4": {
    answers: ["5uGRLrUdF4"],
    auto: true,
  },
  MEfebdfah0: {
    answers: ["MEfebdfah0"],
    auto: true,
  },
  Y05nCrMuJV: {
    answers: ["ANNmSPkOMB"],
    auto: true,
  },
  LRIlR6XQpa: {
    answers: ["u2OxJ6DhWK", "aaghpbdKBR"],
    auto: true,
  },
  "5tyPXLrKCf": {
    answers: ["an answer"],
    auto: true,
  },
  "6RtX4nCoFx": {
    auto: true,
  },
  "0q9S6JfcZh": {
    answers: [
      // temporary measure to ensure that the answers are an array of strings, not objects
      JSON.stringify({
        filename: "planx.png",
        url: "https://planx-temp.s3.eu-west-2.amazonaws.com/development/11q1npcp/planx.png",
      }),
    ],
    auto: true,
  },
  toSzQ8Afxr: {
    auto: true,
  },
  lBhoS6eLky: {
    auto: true,
  },
};
const flow = {
  _root: {
    edges: [
      "5uGRLrUdF4",
      "MEfebdfah0",
      "Y05nCrMuJV",
      "TQNqwzSpAS",
      "6RtX4nCoFx",
      "0q9S6JfcZh",
      "toSzQ8Afxr",
      "lBhoS6eLky",
      "LVsfxkd1uz",
    ],
  },
  "0q9S6JfcZh": {
    data: {
      color: "#EFEFEF",
      title: "A file upload",
    },
    type: 140,
  },
  "2zQbbodM7n": {
    data: {
      val: "PLANNING_PERMISSION_REQUIRED",
      text: "Permission needed",
    },
    type: 200,
  },
  "5tyPXLrKCf": {
    data: {
      title: "A text input",
      description: "Description\n",
      placeholder: "placeholder\n",
    },
    type: 110,
  },
  "5uGRLrUdF4": {
    type: 6,
  },
  "6RtX4nCoFx": {
    data: {
      tasks: [
        {
          title: "A task",
          description: "www\n",
        },
        {
          title: "Another task",
          description: "wwww\n",
        },
      ],
    },
    type: 7,
  },
  ANNmSPkOMB: {
    data: {
      text: "An option",
    },
    type: 200,
    edges: ["crVbi9HiXP"],
  },
  LRIlR6XQpa: {
    data: {
      text: "A checklist",
      allRequired: false,
    },
    type: 105,
    edges: ["aaghpbdKBR", "u2OxJ6DhWK"],
  },
  LVsfxkd1uz: {
    data: {
      fn: "flag",
    },
    type: 500,
    edges: [
      "patK4Zx4qg",
      "gOmbOsj0hw",
      "2zQbbodM7n",
      "RyySCuR0z8",
      "OPeN1FWYfZ",
      "vJKSgChbLF",
      "bq63VNlyEB",
      "wViIvfuIJC",
    ],
  },
  MEfebdfah0: {
    type: 5,
  },
  OPeN1FWYfZ: {
    data: {
      val: "PP-NOTICE",
      text: "Notice",
    },
    type: 200,
  },
  RyySCuR0z8: {
    data: {
      val: "PRIOR_APPROVAL",
      text: "Prior approval",
    },
    type: 200,
  },
  TQNqwzSpAS: {
    data: {
      title: "A page",
    },
    type: 350,
    edges: ["LRIlR6XQpa", "5tyPXLrKCf"],
  },
  Y05nCrMuJV: {
    data: {
      text: "A question",
    },
    type: 100,
    edges: ["ANNmSPkOMB", "vEsTPHEQTZ"],
  },
  aaghpbdKBR: {
    data: {
      text: "A check option",
    },
    type: 200,
  },
  bq63VNlyEB: {
    data: {
      val: "PP-NOT_DEVELOPMENT",
      text: "Not development",
    },
    type: 200,
  },
  crVbi9HiXP: {
    data: {
      text: "aaa",
    },
    type: 300,
  },
  gOmbOsj0hw: {
    data: {
      val: "IMMUNE",
      text: "Immune",
    },
    type: 200,
  },
  lBhoS6eLky: {
    type: 3,
  },
  patK4Zx4qg: {
    data: {
      val: "MISSING_INFO",
      text: "Missing information",
    },
    type: 200,
  },
  toSzQ8Afxr: {
    data: {
      color: "#EFEFEF",
      title: "A notice",
      resetButton: false,
    },
    type: 8,
  },
  u2OxJ6DhWK: {
    data: {
      text: "Another check option",
    },
    type: 200,
  },
  vEsTPHEQTZ: {
    data: {
      text: "Another option",
    },
    type: 200,
    edges: ["crVbi9HiXP"],
  },
  vJKSgChbLF: {
    data: {
      val: "NO_APP_REQUIRED",
      text: "Permitted development",
    },
    type: 200,
  },
  wViIvfuIJC: {
    data: {
      text: "(No Result)",
    },
    type: 200,
  },
};

export const Frontend: StoryFn<{}> = () => {
  return (
    <Presentational
      title="Review"
      description="Check your answers before submitting"
      breadcrumbs={breadcrumbs}
      flow={flow}
      passport={passport}
      handleSubmit={console.log}
      changeAnswer={(nodeId) => {
        window.alert(`nodeId=${nodeId}`);
      }}
      showChangeButton={true}
    />
  );
};

export default metadata;
