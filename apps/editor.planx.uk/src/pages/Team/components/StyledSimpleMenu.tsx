import { styled } from "@mui/material/styles";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import SimpleMenu from "ui/editor/SimpleMenu";

export interface FlowMenuProps {
  flow: FlowSummary;
  isAnyTemplate?: boolean;
  variant?: "card" | "table";
  teamId: number;
  userId: number;
}

export const StyledSimpleMenu = styled(SimpleMenu)(({ theme }) => ({
  display: "flex",
  marginTop: "auto",
  borderTop: `1px solid ${theme.palette.border.light}`,
  backgroundColor: theme.palette.background.paper,
  overflow: "hidden",
  borderRadius: "0px 0px 4px 4px",
  maxHeight: "35px",
  "& > button": {
    padding: theme.spacing(0.25, 1),
    width: "100%",
    justifyContent: "flex-start",
    "& > svg": {
      display: "none",
    },
  },
}));