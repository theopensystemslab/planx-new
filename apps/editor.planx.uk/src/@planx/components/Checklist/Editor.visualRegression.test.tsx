import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useStore } from "pages/FlowEditor/lib/store";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { defaultTheme } from "theme";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

import { ChecklistEditor } from "./Editor";

const { setState } = useStore;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

test("editor checklist component renders correctly", async () => {
  setState({
    user: {
      id: 1,
      firstName: "Editor",
      lastName: "Test",
      isPlatformAdmin: true,
      isAnalyst: true,
      email: "test@test.com",
      teams: [],
      defaultTeamId: null,
    },
    jwt: "x.y.z",
  });

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
    <QueryClientProvider client={queryClient}>
      <DndProvider backend={HTML5Backend}>
        <ThemeProvider theme={defaultTheme}>
          <ChecklistEditor options={options} />
        </ThemeProvider>
        ,
      </DndProvider>
      ,
    </QueryClientProvider>,
  );

  expect(checklist.getByTestId("checklistEditorForm")).toMatchScreenshot({
    timeout: 2_000,
  });
});
