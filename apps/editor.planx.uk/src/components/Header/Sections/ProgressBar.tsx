import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import { useStore } from "pages/FlowEditor/lib/store";
import { selectSectionProgress } from "pages/FlowEditor/lib/store/selectors";

const Root = styled(LinearProgress)(({ theme }) => ({
  height: theme.spacing(2),
  borderRadius: theme.spacing(2),
  // Background
  [`& .${linearProgressClasses.dashed}`]: {
    animation: "none",
    backgroundImage: "none",
    backgroundColor: `rgba(255, 255, 255, 0.3)`,
    "@media print": {
      backgroundColor: theme.palette.common.white,
      border: `1px solid ${theme.palette.border.main}`,
    },
  },
  // Completed
  [`& .${linearProgressClasses.bar1}`]: {
    backgroundColor: theme.palette.common.white,
    "@media print": {
      backgroundColor: "#888",
    },
  },
  // Current
  [`& .${linearProgressClasses.bar2}`]: {
    backgroundColor: "transparent",
    backgroundImage: `linear-gradient(135deg, rgba(255, 255, 255, 0.9) 12.50%, transparent 12.50%, transparent 50%, rgba(255, 255, 255, 0.9) 50%, rgba(255, 255, 255, 0.9) 62.50%, transparent 62.50%, transparent 100%)`,
    backgroundSize: "4.24px 4.24px",
    "@media print": {
      backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.9) 12.50%, transparent 12.50%, transparent 50%, rgba(0, 0, 0, 0.9) 50%, rgba(0, 0, 0, 0.9) 62.50%, transparent 62.50%, transparent 100%)`,
    },
  },
}));

export const ProgressBar: React.FC = () => {
  const progress = useStore(selectSectionProgress);

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
