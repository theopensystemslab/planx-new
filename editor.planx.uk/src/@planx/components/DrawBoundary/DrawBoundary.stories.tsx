import Wrapper from "@planx/components/fixtures/Wrapper";
import { Meta } from "@storybook/react";
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
        osProxyEndpoint={`${process.env.REACT_APP_API_URL}/proxy/ordnance-survey`}
      />
    </>
  );
};
