import { Meta } from "@storybook/react";
import React from "react";

import Public from "./Public";

const metadata: Meta = {
  title: "PlanX Components/FileUpload",
};

export const Upload = () => {
  return (
    <Public
      title="License for Coding"
      description="Please upload document(s) that prove you're allowed to write code"
      handleSubmit={console.log}
    />
  );
};
export default metadata;
