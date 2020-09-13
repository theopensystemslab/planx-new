import React, { useState } from "react";

import RichTextInput from "../RichTextInput";
import FixtureContainer from "./FixtureContainer";
import { Box } from "@material-ui/core";

const Fixture: React.FC<{}> = () => {
  const [value, setValue] = useState("Something");

  return (
    <FixtureContainer>
      <RichTextInput
        value={value}
        onChange={(ev) => {
          setValue(ev.target.value);
        }}
      />
      <Box>
        <p>Markdown result:</p>
        <pre>{value}</pre>
        <button
          onClick={() => {
            setValue("Something");
          }}
        >
          Reset
        </button>
      </Box>
    </FixtureContainer>
  );
};

export default Fixture;
