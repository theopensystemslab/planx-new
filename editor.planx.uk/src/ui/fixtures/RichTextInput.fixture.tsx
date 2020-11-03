import { Box } from "@material-ui/core";
import React, { useState } from "react";

import RichTextInput from "../RichTextInput";

const Fixture: React.FC<{}> = () => {
  const [value, setValue] = useState("Something");

  return (
    <>
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
    </>
  );
};

export default Fixture;
