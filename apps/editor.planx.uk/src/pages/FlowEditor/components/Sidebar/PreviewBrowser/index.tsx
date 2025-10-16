import Button from "@mui/material/Button";
import {
  createTheme,
  styled,
  ThemeProvider,
  useTheme,
} from "@mui/material/styles";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import Reset from "ui/icons/Reset";

import Questions from "../../../../Preview/Questions";

const ResetToggle = styled(Button)(({ theme }) => ({
  position: "absolute",
  top: 0,
  right: theme.spacing(3),
  padding: theme.spacing(1, 1, 1, 0),
  textDecorationStyle: "solid",
  color: theme.palette.text.primary,
}));

export const PreviewBrowser: React.FC = () => {
  const [resetPreview] = useStore((state) => [state.resetPreview]);

  const theme = useTheme();
  const mobileTheme = createTheme({
    ...theme,
    breakpoints: {
      values: {
        xs: 0,
        // Force mobile breakpoints as sidebar is pinned at 500px
        sm: 9999,
        md: 9999,
        lg: 9999,
        xl: 9999,
        formWrap: 9999,
        contentWrap: 9999,
        contentWide: 9999,
      },
    },
  });

  return (
    <ThemeProvider theme={mobileTheme}>
      <ResetToggle variant="link" onClick={() => resetPreview()}>
        <Reset fontSize="small" />
        Restart
      </ResetToggle>
      <Questions previewEnvironment="editor" />
    </ThemeProvider>
  );
};
