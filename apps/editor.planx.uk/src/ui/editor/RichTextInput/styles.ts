import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { alpha, styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { getInputFocusStyle } from "theme";

/**
 * Maximum height of the editable area before it scrolls internally
 * Keeps the formatting toolbar in view when editing long content, even within tall modals
 */
export const RICH_TEXT_MAX_HEIGHT = "50vh";

export const RichContentContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  // Toolbar and "rich text" marker are swapped via :focus-within, rather than React state
  // This guarantees only the focused field shows a toolbar, and the toolbar stays visible
  // whilst interacting with its own controls (e.g. the link URL input)
  "&:focus-within .rte-toolbar": {
    display: "flex",
  },
  "&:focus-within .rte-marker": {
    display: "none",
  },
  // Focus ring wraps both the toolbar and the editable area, so they read as one control
  "&:focus-within::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    ...getInputFocusStyle(theme),
    zIndex: 3,
  },
  "& .rte-field": {
    position: "relative",
  },
  // Scroll container for the editable area
  "& .rte-content": {
    maxHeight: RICH_TEXT_MAX_HEIGHT,
    overflowY: "auto",
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.border.main}`,
  },
  "& .ProseMirror": {
    padding: "12px 15px",
    // Leave space for the "rich text" marker
    paddingRight: "45px",
    backgroundColor: theme.palette.background.default,
    // 50px total height, including the .rte-content border
    minHeight: "48px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    wordBreak: "break-word",
    "& a": {
      color: "currentColor",
    },
    "& > *": {
      margin: 0,
    },
    "& > * + *": {
      marginTop: theme.spacing(1),
    },
    "& ol, & ul": {
      marginBottom: theme.spacing(1),
    },
    "& ol li, & ul li": {
      margin: theme.spacing(0.5, 0, 0),
    },
    "& ol p, & ul p": {
      margin: 0,
    },
    "& h1, & h2, & h3": {
      "& strong": {
        fontWeight: "inherit",
      },
    },
    // Styles for placeholder text, to match ui/Input.tsx
    "& p.is-editor-empty:first-of-type::before": {
      color: theme.palette.text.placeholder,
      opacity: 1,
      content: `attr(data-placeholder)`,
      float: "left",
      height: 0,
      pointerEvents: "none",
    },
    "&:focus-visible": {
      outline: "none",
    },
    // Styles for injected passport/mention
    "& .passport": {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.text.primary,
      padding: theme.spacing(0.25, 0.5),
      borderRadius: "4px",
    },
    // Styles for disabled input
    '&[contenteditable="false"]': {
      backgroundColor: theme.palette.background.disabled,
      color: theme.palette.text.disabled,
    },
  },
  "&.rich-text-editor": {
    "& h1": {
      fontSize: theme.typography.h1.fontSize,
    },
    "& h2": {
      fontSize: theme.typography.h2.fontSize,
    },
  },
}));

export const Toolbar = styled(Box)(({ theme }) => ({
  display: "none",
  alignItems: "center",
  flexWrap: "wrap",
  gap: theme.spacing(0.25),
  padding: theme.spacing(0.25, 0.5),
  // Stay in view when scrolling through long content within a modal
  position: "sticky",
  top: 0,
  zIndex: 2,
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.border.main}`,
  borderBottom: 0,
}));

export const ToolbarDivider = styled("span")(({ theme }) => ({
  width: "1px",
  height: "20px",
  margin: theme.spacing(0, 0.5),
  backgroundColor: theme.palette.border.light,
}));

/** Indicates that a field supports rich text, shown whilst the field is not focused */
export const RichTextMarker = styled("span")(({ theme }) => ({
  position: "absolute",
  top: "13px",
  right: "13px",
  zIndex: 1,
  height: "1lh",
  display: "flex",
  alignItems: "center",
  gap: "1px",
  color: theme.palette.text.placeholder,
  cursor: "text",
  userSelect: "none",
  letterSpacing: "-0.05em",
  "& > span": {
    lineHeight: 1,
  },
  "& .rte-marker-bold": {
    fontWeight: "bold",
  },
  "& .rte-marker-italic": {
    fontStyle: "italic",
  },
}));

export const MentionItems = styled(Box)(({ theme }) => ({
  background: theme.palette.background.default,
  fontSize: "0.875em",
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
  borderRadius: "4px",
  width: "150px",
  overflow: "hidden",
  padding: theme.spacing(0.25),
}));

export const MentionItemsButton = styled(Button)(({ theme }) => ({
  border: 0,
  background: "none",
  boxShadow: "none",
  padding: theme.spacing(0.25),
  display: "block",
  width: "100%",
  textAlign: "left",
  "&.mention-item-selected": {
    background: alpha(theme.palette.text.primary, 0.03),
  },
}));

export const MentionItemsEmpty = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(0.25),
  margin: 0,
  color: theme.palette.text.secondary,
}));
