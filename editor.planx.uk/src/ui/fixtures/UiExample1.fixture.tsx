import React, { useState } from "react";
import FixtureContainer from "./FixtureContainer";
import VisibilityToggle from "../VisibilityToggle";
import ColorPicker from "../ColorPicker";
import OptionButton from "../OptionButton";

const UiExample1: React.FC<{}> = () => {
  const [visible, setVisible] = useState(false);

  const [color, setColor] = useState("#000");

  const [optionButtonSelected, setOptionButtonSelected] = useState(false);

  return (
    <FixtureContainer>
      <VisibilityToggle visible={visible} onChange={setVisible} />
      <ColorPicker color={color} onChange={setColor} />
      <OptionButton
        selected={optionButtonSelected}
        onClick={() => {
          setOptionButtonSelected((prevSelected) => !prevSelected);
        }}
      >
        Selected
      </OptionButton>
    </FixtureContainer>
  );
};

export default UiExample1;
