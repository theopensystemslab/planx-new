import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { IconArrowRight } from "@tabler/icons-react";
import { Icon, type TablerIcon } from "ui/icons/Icon";

interface Props {
  label: string;
  Icon?: TablerIcon;
  showArrow?: boolean;
  format?: "positive" | "negative";
  onClick: () => void;
}

const Root = styled(Button, {
  shouldForwardProp: (prop) =>
    !["fullWidth", "format", "Icon", "showArrow"].includes(prop.toString()),
})<Props>(({ theme, showArrow, format }) => ({
  backgroundColor: theme.palette.common.white,
  color: theme.palette.text.primary,
  padding: "0.75em",
  margin: theme.spacing(0.75, 0.75, 0.75, 0),
  justifyContent: "flex-start",
  ...(showArrow && {
    width: "100%",
  }),
  ...(format === "positive" && {
    "& .buttonIcon": {
      color: theme.palette.success.main,
    },
  }),
  ...(format === "negative" && {
    "& .buttonIcon": {
      color: theme.palette.error.main,
    },
  }),
}));

const IconWrapper = styled("span")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  color: theme.palette.primary.main,
}));

const Label = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(0, 1),
})) as typeof Typography;

const ArrowButton = styled("span")(({ theme }) => ({
  marginLeft: "auto",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: theme.palette.prompt.main,
  color: theme.palette.prompt.contrastText,
  width: "36px",
  height: "36px",
  flexShrink: "0",
}));

export default function FeedbackOption(props: Props): FCReturn {
  return (
    <Root {...props}>
      {props.Icon && (
        <IconWrapper className="buttonIcon">
          <Icon icon={props.Icon} />
        </IconWrapper>
      )}
      <Label variant="h4" component="span">
        {props.label}
      </Label>
      {props.showArrow && (
        <ArrowButton>
          <Icon icon={IconArrowRight} />
        </ArrowButton>
      )}
    </Root>
  );
}
