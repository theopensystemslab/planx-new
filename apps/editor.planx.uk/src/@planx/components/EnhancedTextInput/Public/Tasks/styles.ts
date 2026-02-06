import Box from "@mui/material/Box";
import FormLabel from "@mui/material/FormLabel";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

interface StyledFormLabelProps {
  isSelected: boolean;
  showBorder: boolean;
}

export const StyledFormLabel = styled(FormLabel, {
  shouldForwardProp: (prop) => prop !== "isSelected" && prop !== "showBorder",
})<StyledFormLabelProps>(({ theme, isSelected, showBorder }) => ({
  display: "flex",
  cursor: "pointer",
  border: showBorder ? "2px solid" : "none",
  borderColor: isSelected
    ? theme.palette.text.primary
    : theme.palette.border.main,
  padding: showBorder ? theme.spacing(4, 1, 1.5, 1) : theme.spacing(0, 1),
  marginLeft: showBorder ? 0 : "2px",
  marginTop: showBorder ? theme.spacing(1) : 0,
  position: "relative",
  marginBottom: showBorder ? theme.spacing(2) : theme.spacing(1),
}));

export const RecommendedTag = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  backgroundColor: theme.palette.secondary.dark,
  color: theme.palette.text.primary,
  padding: theme.spacing(0.25, 1.5),
  fontSize: theme.typography.body3.fontSize,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
}));

export const QuoteDescription = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  color: theme.palette.text.primary,
  position: "relative",
})) as typeof Typography;

export const RevealedContent = styled(Box)(({ theme }) => ({
  borderLeft: `4px solid ${theme.palette.border.main}`,
  paddingLeft: theme.spacing(3.45),
  marginLeft: theme.spacing(3.2),
  paddingTop: theme.spacing(1),
}));
