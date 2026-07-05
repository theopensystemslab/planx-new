import { styled } from "@mui/material/styles";
import type { TypographyProps } from "@mui/material/Typography";
import Typography from "@mui/material/Typography";

interface TruncatedTextProps extends TypographyProps {
  lineClamp?: number;
}

const TruncatedText = styled(Typography, {
  shouldForwardProp: (prop) => prop !== "lineClamp",
})<TruncatedTextProps>(({ lineClamp = 2 }) => ({
  display: "-webkit-box",
  WebkitLineClamp: lineClamp,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));

export default TruncatedText;
