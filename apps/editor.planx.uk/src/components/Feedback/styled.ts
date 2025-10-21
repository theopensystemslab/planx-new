import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

export const FeedbackWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.border.main}`,
}));

export const FeedbackRow = styled(Box)(({ theme }) => ({
  maxWidth: theme.breakpoints.values.formWrap,
  padding: theme.spacing(2, 0, 4),
}));

export const FeedbackHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1, 0),
  position: "relative",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

export const FeedbackTitle = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  "& svg": {
    width: "28px",
    height: "auto",
    color: theme.palette.primary.dark,
    marginRight: theme.spacing(1),
  },
}));

export const CloseButton = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  color: theme.palette.text.primary,
}));

export const FeedbackBody = styled(Box)(({ theme }) => ({
  maxWidth: theme.breakpoints.values.formWrap,
}));
