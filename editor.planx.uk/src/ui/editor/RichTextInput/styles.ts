import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { BubbleMenu } from "@tiptap/react";

export const StyledBubbleMenu = styled(BubbleMenu)(({ theme }) => ({
  background: theme.palette.background.default,
  boxShadow: "0 2px 6px 0 rgba(0, 0, 0, 0.2)",
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0.25),
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
