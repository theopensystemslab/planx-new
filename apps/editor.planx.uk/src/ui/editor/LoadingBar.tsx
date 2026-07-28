import Box from "@mui/material/Box";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { keyframes, styled } from "@mui/material/styles";

// Loading bar looping animation
const loadFill = keyframes`
  0% { transform: scaleX(0); }
  50% { transform: scaleX(1); }
  100% { transform: scaleX(1); }
`;

const loadFollow = keyframes`
  0% { transform: scaleX(0); }
  50% { transform: scaleX(0); }
  100% { transform: scaleX(1); }
`;

const StyledBar = styled(LinearProgress)(({ theme }) => ({
  width: 48,
  height: 6,
  backgroundColor: theme.palette.grey[300],
  [`& .${linearProgressClasses.bar1}`]: {
    width: "100%",
    backgroundColor: theme.palette.common.black,
    animation: `${loadFill} 1.6s ease-in-out infinite`,
  },
  [`& .${linearProgressClasses.bar2}`]: {
    width: "100%",
    backgroundColor: theme.palette.grey[300],
    animation: `${loadFollow} 1.6s ease-in-out infinite`,
  },
}));

interface LoadingBarProps {
  "aria-label"?: string;
}

export function LoadingBar({ "aria-label": ariaLabel }: LoadingBarProps) {
  return (
    <StyledBar variant="indeterminate" aria-label={ariaLabel ?? "Loading"} />
  );
}

export const EmptyLoadingBar = styled(Box)(({ theme }) => ({
  width: 48,
  height: 6,
  backgroundColor: theme.palette.text.disabled,
}));
