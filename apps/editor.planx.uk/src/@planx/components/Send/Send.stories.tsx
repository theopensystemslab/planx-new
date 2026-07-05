import { ComponentType } from "@opensystemslab/planx-core/types";
import type { Meta } from "@storybook/tanstack-react";

import Wrapper from "../fixtures/Wrapper";
import Editor from "./Editor";
import Public from "./Public";

const meta = {
  title: "PlanX Components/Send",
  component: Public,
} satisfies Meta<typeof Public>;

export default meta;

export const WithEditor = () => {
  return (
    <Wrapper
      Editor={Editor}
      Public={Public}
      componentType={ComponentType.Send}
    />
  );
};
