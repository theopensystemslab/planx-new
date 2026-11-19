import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { alpha, styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { getInputFocusStyle } from "theme";

export const RichContentContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  // Toolbar and "rich text" marker are swapped via :focus-within, rather than React state
  // Also held open whilst the native file dialog is open (see RichTextToolbar)
  "&:focus-within, &:has(> .rich-text-toolbar[data-held-open])": {
    "& .rich-text-toolbar": {
      display: "flex",
    },
    "& .rich-text-marker": {
      display: "none",
    },
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
  // Matches getInputFocusStyle(), which shows a 3px focus band
  "&:focus-within .rich-text-toolbar": {
    "&::before": {
      content: '""',
      position: "absolute",
      top: -3,
      left: -3,
      right: -3,
      bottom: -1,
      border: `3px solid ${theme.palette.action.focus}`,
      borderBottom: 0,
      // Create a visual border inside the focus right
      boxShadow: [
        `inset 1px 0 0 ${theme.palette.border.input}`,
        `inset -1px 0 0 ${theme.palette.border.input}`,
        `inset 0 1px 0 ${theme.palette.border.input}`,
      ].join(", "),
      pointerEvents: "none",
    },
    // Cover the input's ring along the edge shared with the toolbar
    "&::after": {
      content: '""',
      position: "absolute",
      top: "calc(100% + 1px)",
      left: 0,
      right: 0,
      height: 2,
      backgroundColor: theme.palette.background.default,
      boxShadow: [
        `inset 1px 0 0 ${theme.palette.border.input}`,
        `inset -1px 0 0 ${theme.palette.border.input}`,
      ].join(", "),
      pointerEvents: "none",
    },
  },
  // Scroll container for the editable area
  // Max-height so the toolbar stays close to the cursor when editing long content
  "& .rich-text-content": {
    maxHeight: "50vh",
    overflowY: "auto",
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.border.main}`,
  },
  "& .rich-text-input": {
    position: "relative",
  },
  // Leave space for the "rich text" marker, which is only shown on editable fields
  "& .rich-text-input:has(.rich-text-marker) .ProseMirror": {
    paddingRight: "45px",
  },
  "& .ProseMirror": {
    padding: "12px 15px",
    backgroundColor: theme.palette.background.default,
    // 50px total height, including the .rich-text-content border
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
    // Focus ring is drawn by RichContentContainer
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
  justifyContent: "flex-end",
  flexWrap: "wrap",
  gap: theme.spacing(0.25),
  padding: theme.spacing(0.25, 0.5),
  "& > span": {
    display: "flex",
  },
  "& .rich-text-image-upload button": {
    width: 34,
    height: 34,
  },
  position: "absolute",
  bottom: "100%",
  right: 0,
  width: "max-content",
  maxWidth: "100%",
  "&[data-link-form]": {
    // Room for the URL input to grow
    width: "600px",
  },
  zIndex: 4,
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.border.main}`,
  borderBottom: `1px solid ${theme.palette.border.light}`,
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
  // Align with the first line of text (.ProseMirror padding + border)
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
  "& .rich-text-marker-bold": {
    fontWeight: "bold",
  },
  "& .rich-text-marker-italic": {
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
