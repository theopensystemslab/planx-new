import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import TableContainer from "@mui/material/TableContainer";
import { SummaryListTable } from "@planx/components/shared/Preview/SummaryList";

export const Feed = styled(TableContainer)(() => ({
  maxHeight: "60vh",
  overflow: "auto",
  display: "flex",
  flexDirection: "column-reverse",
  readingOrder: "flex-visual",
}));

export const DetailedFeedback = styled(Box)(({ theme }) => ({
  fontSize: "1em",
  margin: 1,
  maxWidth: "100%",
  padding: theme.spacing(2, 1),
}));

export const StyledSummaryListTable = styled(SummaryListTable)(() => ({
  "& p": {
    margin: 0,
  },
}));
