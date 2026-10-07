import Box from "@mui/material/Box";
import CheckCircleIcon from "ui/icons/CheckCircle";
import { Dot } from "ui/shared/Dot";

interface Props {
  isComplete: boolean;
  "data-testid"?: string;
}

/**
 * Small status indicator - a green tick when complete, an amber dot when action is required
 */
export const StatusMarker: React.FC<Props> = ({
  isComplete,
  "data-testid": testId,
}) => (
  <Box
    data-testid={testId}
    sx={{
      width: 20,
      height: 22,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {isComplete ? (
      <CheckCircleIcon fontSize="small" sx={{ color: "success.main" }} />
    ) : (
      <Dot size={10} sx={{ bgcolor: "warning.main" }} />
    )}
  </Box>
);
