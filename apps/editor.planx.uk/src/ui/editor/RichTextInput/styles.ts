import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { BubbleMenu } from "@tiptap/react/menus";
import { inputFocusStyle } from "theme";

export const RichContentContainer = styled(Box)(({ theme }) => ({
  "& .ProseMirror": {
    padding: "12px 15px",
    backgroundColor: theme.palette.common.white,
    minHeight: "50px",
    border: `1px solid ${theme.palette.border.main}`,
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
    // Focus styles
    "&.ProseMirror-focused": {
      ...inputFocusStyle,
      zIndex: 0,
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
  "&.rich-text-editor:not(.allow-h1)": {
    "& h1": {
      fontSize: theme.typography.h1.fontSize,
    },
    "& h2": {
      fontSize: theme.typography.h2.fontSize,
    },
  },
}));

export const StyledBubbleMenu = styled(BubbleMenu)(({ theme }) => ({
  background: theme.palette.background.default,
  boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.2)",
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0.25),
  zIndex: theme.zIndex.tooltip,
}));

export const MentionItems = styled(Box)(({ theme }) => ({
  background: theme.palette.common.white,
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
    background: `rgba(0, 0, 0, 0.03)`,
  },
}));

export const MentionItemsEmpty = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(0.25),
  margin: 0,
  color: theme.palette.text.secondary,
}));
