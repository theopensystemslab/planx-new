import React, { useState } from "react";

import RichTextInput from "../RichTextInput";
import FixtureContainer from "./FixtureContainer";

const RichTextSnippet: React.FC<{}> = () => {
  const [value, setValue] = useState("Something");

  return (
    <FixtureContainer>
      <RichTextInput
        value={value}
        onChange={(ev) => {
          setValue(ev.target.value);
        }}
      />
      <p>Markdown result:</p>
      <pre>{value}</pre>
    </FixtureContainer>
  );
};

export default {
  RichText: <RichTextSnippet />,
};
