import React, { useState } from "react";

import RichTextInput from "../RichTextInput";
import theme from "../../../../../../theme";
import ThemeProvider from "@material-ui/styles/ThemeProvider";

const wait = (timeout: number): Promise<unknown> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });

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
          onImageUpload={() => {
            return wait(1500).then(() => "https://image.com/image.png");
          }}
        />
      </ThemeProvider>

      <p>Markdown result:</p>
      <pre>{value}</pre>
    </div>
  );
};

export default {
  RichText: <RichTextSnippet />,
};
