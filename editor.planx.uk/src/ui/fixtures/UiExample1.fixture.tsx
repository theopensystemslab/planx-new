import React, { useState } from "react";
import ColorPicker from "../ColorPicker";
import OptionButton from "../OptionButton";
import VisibilityToggle from "../VisibilityToggle";

const UiExample1: React.FC<{}> = () => {
  const [visible, setVisible] = useState(false);

  const [color, setColor] = useState("#000");

  const [optionButtonSelected, setOptionButtonSelected] = useState(false);

  return (
    <>
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
    </>
  );
};

export default UiExample1;
