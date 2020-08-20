import React, { useState } from "react";

import RichTextInput from "../RichTextInput";
import theme from "../../../../../../theme";
import ThemeProvider from "@material-ui/styles/ThemeProvider";

const RichTextSnippet: React.FC<{}> = () => {
  const [value, setValue] = useState("Something");

  return (
    <div style={{ padding: 80 }}>
      <ThemeProvider theme={theme}>
        <RichTextInput
          value={value}
          onChange={(ev) => {
            setValue(ev.target.value);
          }}
        />
      </ThemeProvider>

      <p>Markdown result: {value}</p>
    </div>
  );
};

export default {
  RichText: <RichTextSnippet />,
};
