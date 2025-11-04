import Chip from "@mui/material/Chip";
import { styled } from "@mui/material/styles";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export const InfoChip = styled(Chip)(({ theme }) => ({
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  border: "1px solid rgba(0, 0, 0, 0.2)",
  backgroundColor: theme.palette.info.light,
  zIndex: theme.zIndex.appBar,
}));
