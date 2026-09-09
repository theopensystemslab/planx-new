import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

interface Props {
  isSourceTemplate: boolean;
  isTemplatedFlow: boolean;
  isPattern: boolean;
  teamName?: string;
}

export const FlowIndicator: React.FC<Props> = ({
  isSourceTemplate,
  isTemplatedFlow,
  isPattern,
  teamName,
}) => {
  if (!isSourceTemplate && !isTemplatedFlow && !isPattern) return null;

  let text: string;
  if (isSourceTemplate) text = "Source template";
  else if (isTemplatedFlow) text = `${teamName}`;
  else text = "Pattern";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
      {isTemplatedFlow && (
        <StarIcon
          data-testid="templated-flow-star"
          sx={{ color: "template.icon", fontSize: "1rem" }}
        />
      )}
      <Typography variant="body3" sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}>
        {text}
      </Typography>
    </Box>
  );
};
