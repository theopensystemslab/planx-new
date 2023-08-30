import Wrapper from "@planx/components/fixtures/Wrapper";
import { Meta } from "@storybook/react";
import React from "react";

import Editor from "./Editor";
import Public from "./Public";

/** DrawBoundary relies on a custom web component that cannot be shown by React Storybook. Find additional docs here: https://oslmap.netlify.app/ */
export default {
  title: "PlanX Components/DrawBoundary",
  component: Public,
} satisfies Meta<typeof Public>;

export const WithEditor = () => <Wrapper Editor={Editor} Public={Public} />;
