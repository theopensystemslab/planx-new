import Card from "@planx/components/shared/Preview/Card";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";

import PayWithCard from "./PayWithCard";

const metadata: Meta = {
  title: "PlanX Components/Pay/PayWithCard",
};

export const Fixture = function () {
  return (
    <Card>
      <PayWithCard />
    </Card>
  );
};

export default metadata;
