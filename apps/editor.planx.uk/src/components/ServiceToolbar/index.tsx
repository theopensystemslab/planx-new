import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import TerminalIcon from "@mui/icons-material/Terminal";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import { useQuery } from "@tanstack/react-query";
import { useMatch } from "@tanstack/react-router";
import { getUser } from "lib/api/auth/requests";
import { getCookie } from "lib/cookie";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { lazy, Suspense, useState } from "react";
import { cardBoxShadow } from "theme";
import EditorIcon from "ui/icons/Editor";
import { CloseButton } from "ui/shared/CloseButton";

const DebugConsole = lazy(() =>
  import("pages/FlowEditor/components/Sidebar/DebugConsole").then(
    ({ DebugConsole }) => ({ default: DebugConsole }),
  ),
);

const Toolbar = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(1.5),
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: theme.zIndex.snackbar,
  display: "flex",
  borderRadius: 50,
  backgroundColor: theme.palette.border.input,
  border: `1px solid ${theme.palette.text.disabled}`,
  boxShadow: cardBoxShadow,
  overflow: "hidden",
  // Target direct children so wrapped buttons (e.g. for tooltips) count as toolbar items
  "& > *:not(:last-child)": {
    borderRight: `1px solid ${theme.palette.text.disabled}`,
  },
  "& > :first-child, & > :first-child > button, & > :first-child > a": {
    paddingLeft: theme.spacing(1.5),
  },
  "& > :last-child, & > :last-child > button, & > :last-child > a": {
    paddingRight: theme.spacing(1.5),
  },
  // Hide the toolbar when printing
  "@media print": {
    display: "none",
  },
}));

const ToolbarButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  padding: theme.spacing(1.1),
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  "&.Mui-disabled": {
    color: "rgba(255, 255, 255, 0.3)",
  },
})) as typeof IconButton;

/**
 * Only render for logged in users
 * The `auth` cookie is a readable flag set alongside the httpOnly `jwt` cookie,
 * checking it first avoids a /user/me request for every applicant
 */
const useIsLoggedIn = () => {
  const hasAuthCookie = Boolean(getCookie("auth"));

  const { isSuccess } = useQuery({
    queryKey: ["user", "me"],
    queryFn: getUser,
    enabled: hasAuthCookie,
    retry: false,
    staleTime: Infinity,
  });

  return hasAuthCookie && isSuccess;
};

const ServiceToolbarContent: React.FC = () => {
  const [teamSlug, flowSlug, currentCard, currentCardURL] = useStore(
    (state) => [
      state.teamSlug,
      state.flowSlug,
      state.currentCard,
      state.currentCardURL,
    ],
  );
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  // Node IDs only reliably map to the editor graph for the draft (unpublished) flow
  const isDraft = Boolean(
    useMatch({
      from: "/_public/_planXDomain/$team/$flow/draft",
      shouldThrow: false,
    }),
  );

  const flowURL = `/app/${teamSlug}/${flowSlug}`;
  const componentURL = isDraft && currentCard ? currentCardURL() : null;

  return (
    <>
      <Toolbar role="toolbar" aria-label="Service toolbar">
        <Tooltip title="Open flow in editor">
          <ToolbarButton
            component="a"
            href={flowURL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open flow in editor"
          >
            <EditorIcon fontSize="small" />
          </ToolbarButton>
        </Tooltip>
        {isDraft && (
          <Tooltip title="Open component in editor">
            {/* Wrapper allows tooltip on a disabled button */}
            <Box component="span" sx={{ display: "flex" }}>
              <ToolbarButton
                component="a"
                href={componentURL ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open component in editor"
                disabled={!componentURL}
              >
                <EditOutlinedIcon fontSize="small" />
              </ToolbarButton>
            </Box>
          </Tooltip>
        )}
        <Tooltip title="View console">
          <ToolbarButton
            aria-label="View console"
            onClick={() => setIsConsoleOpen(true)}
          >
            <TerminalIcon fontSize="small" />
          </ToolbarButton>
        </Tooltip>
      </Toolbar>
      <Dialog
        open={isConsoleOpen}
        onClose={() => setIsConsoleOpen(false)}
        maxWidth="md"
        fullWidth
        aria-labelledby="service-toolbar-console-title"
      >
        <Box sx={{ display: "flex", alignItems: "center", marginX: 1 }}>
          <DialogTitle
            id="service-toolbar-console-title"
            variant="h3"
            component="h2"
          >
            Console
          </DialogTitle>
          <CloseButton
            aria-label="Close console"
            onClick={() => setIsConsoleOpen(false)}
          />
        </Box>
        <DialogContent sx={{ p: 0 }}>
          <Suspense fallback={null}>
            <DebugConsole />
          </Suspense>
        </DialogContent>
      </Dialog>
    </>
  );
};

const ServiceToolbar: React.FC = () => {
  const isLoggedIn = useIsLoggedIn();
  if (!isLoggedIn) return null;

  return <ServiceToolbarContent />;
};

export default ServiceToolbar;
