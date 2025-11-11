import Button from "@mui/material/Button";
import {
  createTheme,
  styled,
  ThemeProvider,
  useTheme,
} from "@mui/material/styles";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { isEmpty } from "lodash";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useMemo } from "react";
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
  const [resetPreview, flow, currentCard] = useStore((state) => [
    state.resetPreview,
    state.flow,
    state.currentCard,
  ]);
  const isLoading = isEmpty(flow);

  const theme = useTheme();
  const mobileTheme = useMemo(
    () =>
      createTheme({
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
      }),
    [theme],
  );

  return (
    <ThemeProvider theme={mobileTheme}>
      <ResetToggle variant="link" onClick={() => resetPreview()}>
        <Reset fontSize="small" />
        Restart
      </ResetToggle>
      {isLoading ? (
        <DelayedLoadingIndicator
          msDelayBeforeVisible={50}
          text="Loading flow data..."
        />
      ) : (
        <Questions previewEnvironment="editor" key={currentCard?.id} />
      )}
    </ThemeProvider>
  );
};
