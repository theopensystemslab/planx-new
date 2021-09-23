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
        maxZoom={20}
        osVectorTilesApiKey={process.env.REACT_APP_ORDNANCE_SURVEY_KEY}
        ariaLabel="An interactive map centered on your address, with a red pointer to draw your site outline. Click to place points and connect the lines to make your site. Once you've closed the site shape, click and drag the lines to modify it. If you cannot draw, you can alternately upload a file using the link below."
      />
    </>
  );
};
