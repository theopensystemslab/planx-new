import { ThemeProvider } from "@mui/material/styles";
import { defaultTheme } from "theme";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

import ChecklistComponent from "./Public";

test("public checklist component renders correctly", async () => {
  const options = [
    {
      id: "UpwFotHUMP",
      data: {
        text: "Here is an option",
        description: "Here are more details about option one",
      },
      type: 200,
    },
    {
      id: "lZKq5dgmBK",
      data: {
        text: "This is another option",
      },
      type: 200,
    },
  ];

  const checklist = await render(
    <ThemeProvider theme={defaultTheme}>
      <ChecklistComponent options={options} />
    </ThemeProvider>,
  );

  expect(checklist.container).toMatchScreenshot({
    timeout: 2_000,
  });
});
