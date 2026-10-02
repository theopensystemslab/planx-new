import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { Icon, type TablerIcon } from "ui/icons/Icon";

interface Props {
  title?: string;
  subtitle?: string;
  children?: React.JSX.Element[] | React.JSX.Element;
  author?: string;
  Icon?: TablerIcon;
}

const SectionContentGrid = styled(Grid)(({ theme }) => ({
  position: "relative",
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  flexWrap: "nowrap",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
}));

const LeftGutter = styled(Grid)(({ theme }) => ({
  flex: `0 0 ${theme.spacing(3)}`,
  textAlign: "center",
  [theme.breakpoints.up("md")]: {
    flex: `0 0 ${theme.spacing(4)}`,
  },
  [theme.breakpoints.up("lg")]: {
    paddingTop: theme.spacing(0.2),
  },
}));

const SectionContent = styled(Grid)(({ theme }) => ({
  flexGrow: 1,
  width: "100%",
  [theme.breakpoints.up("md")]: {
    paddingRight: theme.spacing(4),
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  paddingBottom: theme.spacing(2),
})) as typeof Typography;

const Subtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  paddingBottom: theme.spacing(2),
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
})) as typeof Typography;

const Author = styled("span")(({ theme }) => ({
  fontWeight: 400,
  color: theme.palette.text.secondary,
}));

export default function ModalSectionContent({
  title,
  subtitle,
  children,
  author,
  Icon: icon,
}: Props): FCReturn {
  return (
    <SectionContentGrid container>
      <LeftGutter>{icon && <Icon icon={icon} />}</LeftGutter>
      <SectionContent>
        {title && (
          <Title variant="h3">
            {title}
            {author && <Author>by {author}</Author>}
          </Title>
        )}
        {subtitle && (
          <Subtitle variant="subtitle1" component={"h4"}>
            {subtitle}
            {author && <Author>by {author}</Author>}
          </Subtitle>
        )}
        {children}
      </SectionContent>
    </SectionContentGrid>
  );
}
