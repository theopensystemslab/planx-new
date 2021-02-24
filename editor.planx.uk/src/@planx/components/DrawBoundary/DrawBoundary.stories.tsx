import Wrapper from "@planx/components/fixtures/Wrapper";
import { Meta } from "@storybook/react/types-6-0";
import React from "react";

import Editor from "./Editor";
import Public from "./Public";
import MapComponent from "./Public/Map";

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
    <MapComponent
      zoom={18}
      lat={51.48590555860495}
      lng={-0.07604657928865735}
      setBoundary={setBoundary}
    />
  );

  function setBoundary(args: any) {
    window.alert(args);
  }
};
