import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

export const EllipsesText = styled(Typography)(() => ({
  "&::after": {
    display: "inline-block",
    animation: "ellipsis steps(1,end) 1s infinite",
    content: '""',
  },
  "@keyframes ellipsis": {
    "0%": { content: '""' },
    "25%": { content: '"."' },
    "50%": { content: '".."' },
    "75%": { content: '"..."' },
    "100%": { content: '""' },
  },
}));
