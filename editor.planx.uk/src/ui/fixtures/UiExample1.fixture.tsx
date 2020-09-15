import React, { useState } from "react";
import FixtureContainer from "./FixtureContainer";
import VisibilityToggle from "../VisibilityToggle";
import ColorPicker from "../ColorPicker";

const UiExample1: React.FC<{}> = () => {
  const [visible, setVisible] = useState(false);

  const [color, setColor] = useState("#000");

  return (
    <FixtureContainer>
      <VisibilityToggle visible={visible} onChange={setVisible} />
      <ColorPicker color={color} onChange={setColor} />
    </FixtureContainer>
  );
};

export default UiExample1;
