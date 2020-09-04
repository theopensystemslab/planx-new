import React, { useState, useEffect } from "react";

import RichTextInput from "../RichTextInput";
import theme from "../../../../../../theme";
import ThemeProvider from "@material-ui/styles/ThemeProvider";

const wait = (timeout: number): Promise<unknown> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });

const localStorageKey = "rte-fixture-value";

const RichTextSnippet: React.FC<{}> = () => {
  const [show, setShow] = useState(true);

  const [value, setValue] = useState(
    localStorage.getItem(localStorageKey) || "Something"
  );

  useEffect(() => {
    localStorage.setItem(localStorageKey, value);
  }, [value]);

  return (
    <div style={{ padding: 80 }}>
      <button
        onClick={() => {
          setShow((prevShow) => !prevShow);
        }}
      >
        {show ? "Hide editor" : "Show editor"}
      </button>
      {show && (
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
      )}

      <p>Markdown result:</p>
      <pre style={{ border: "1px solid #cecece" }}>{value}</pre>
    </div>
  );
};

export default {
  RichText: <RichTextSnippet />,
};
