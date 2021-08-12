import Wrapper from "@planx/components/fixtures/Wrapper";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";

import Editor from "./Editor";
import Public from "./Public";

const metadata: Meta = {
  title: "PlanX Components/DrawBoundary",
  argTypes: {
    handleSubmit: { action: true },
  },
};

export default metadata;

export const WithEditor = () => <Wrapper Editor={Editor} Public={Public} />;

export const MapOnly = () => {
  return (
    <>
      {/* @ts-ignore */}
      <my-map
        drawMode
        zoom={19}
        osVectorTilesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
      />
    </>
  );
};
