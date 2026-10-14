import Box from "@mui/material/Box";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { FONT_WEIGHT_BOLD } from "theme";
import { StatusMarker } from "ui/editor/StatusMarker";

interface Props {
  required: number;
  completed: number;
}

const Container = styled(Box, {
  shouldForwardProp: (prop) => prop !== "hasEveryRequiredNodeBeenUpdated",
})<{ hasEveryRequiredNodeBeenUpdated: boolean }>(
  ({ theme, hasEveryRequiredNodeBeenUpdated }) => ({
    background: theme.palette.background.default,
    border: `1px solid ${theme.palette.border.light}`,
    borderTop: `6px solid`,
    borderTopColor: hasEveryRequiredNodeBeenUpdated
      ? theme.palette.success.dark
      : theme.palette.warning.dark,
    padding: theme.spacing(1.5, 2, 1.5, 1.5),
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
  }),
);

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  margin: theme.spacing(1, 0, 0.5),
  backgroundColor: theme.palette.border.light,
  borderRadius: 8,
  [`& .${linearProgressClasses.bar}`]: {
    backgroundColor: theme.palette.success.main,
  },
}));

export const CustomisationCounter: React.FC<Props> = ({
  required,
  completed,
}) => {
  // Nothing to track if the template has no required customisations
  if (!required) return null;

  const outstanding = required - completed;
  const hasEveryRequiredNodeBeenUpdated = outstanding === 0;
  const progress = (completed / required) * 100;

  return (
    <Container
      hasEveryRequiredNodeBeenUpdated={hasEveryRequiredNodeBeenUpdated}
    >
      <Box>
        <StatusMarker
          isComplete={hasEveryRequiredNodeBeenUpdated}
          data-testid={
            hasEveryRequiredNodeBeenUpdated
              ? "required-customisations-complete"
              : "outstanding-required-customisations"
          }
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHT_BOLD }}>
          {hasEveryRequiredNodeBeenUpdated
            ? "All required nodes customised"
            : `${outstanding} ${outstanding === 1 ? "node" : "nodes"} to customise`}
        </Typography>
        {!hasEveryRequiredNodeBeenUpdated && (
          <Typography variant="body3">
            Customise all required nodes before publishing
          </Typography>
        )}
        <Stack>
          <ProgressBar
            variant="determinate"
            value={progress}
            aria-label="Required nodes customised"
          />
          <Typography variant="caption">
            {completed} of {required} required nodes customised
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
};
