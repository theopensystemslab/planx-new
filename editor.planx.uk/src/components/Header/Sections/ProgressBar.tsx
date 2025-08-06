import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

const Root = styled(LinearProgress)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  height: theme.spacing(1),
  // Background
  [`& .${linearProgressClasses.dashed}`]: {
    animation: "none",
    backgroundImage: "none",
    backgroundColor: theme.palette.background.paper,
  },
  // Completed
  [`& .${linearProgressClasses.bar1Buffer}`]: {
    backgroundColor: theme.palette.primary.light,
  },
  // Current
  [`& .${linearProgressClasses.bar2Buffer}`]: {
    backgroundColor: theme.palette.action,
  },
}));

export const ProgressBar: React.FC = () => {
  const { completed, current } = useStore((state) =>
    state.getSectionProgress(),
  );

  return (
    <Root
      variant="buffer"
      value={completed}
      valueBuffer={current + completed}
      aria-label="Section progress bar"
    />
  );
};
