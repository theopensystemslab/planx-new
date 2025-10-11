import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

const Root = styled(LinearProgress)(({ theme }) => ({
  height: theme.spacing(2),
  borderRadius: theme.spacing(2),
  // Background
  [`& .${linearProgressClasses.dashed}`]: {
    animation: "none",
    backgroundImage: "none",
    backgroundColor: `rgba(255, 255, 255, 0.3)`,
  },
  // Completed
  [`& .${linearProgressClasses.bar1Buffer}`]: {
    backgroundColor: theme.palette.common.white,
  },
  // Current
  [`& .${linearProgressClasses.bar2Buffer}`]: {
    backgroundColor: "transparent",
    backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 12.50%, transparent 12.50%, transparent 50%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 0.9) 62.50%, transparent 62.50%, transparent 100%)`,
    backgroundSize: "4.24px 4.24px",
  },
}));

export const ProgressBar: React.FC = () => {
  const progress = useStore((state) => state.sectionProgress);

  if (!progress) return;

  const { completed, current } = progress;

  return (
    <Root
      variant="buffer"
      value={completed}
      valueBuffer={current + completed}
      aria-label="Section progress bar"
    />
  );
};
