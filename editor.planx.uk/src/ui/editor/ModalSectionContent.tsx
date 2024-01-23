import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import SvgIcon from "@mui/material/SvgIcon";
import Typography from "@mui/material/Typography";
import React from "react";

interface Props {
  title?: string;
  subtitle?: string;
  children?: JSX.Element[] | JSX.Element;
  author?: string;
  Icon?: typeof SvgIcon;
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
    flex: `0 0 ${theme.spacing(6)}`,
  },
}));

const SectionContent = styled(Grid)(({ theme }) => ({
  flexGrow: 1,
  width: "100%",
  [theme.breakpoints.up("md")]: {
    paddingRight: theme.spacing(6),
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  paddingBottom: theme.spacing(2),
})) as typeof Typography;

const Subtitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  paddingBottom: theme.spacing(2),
  fontWeight: 600,
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
  Icon,
}: Props): FCReturn {
  return (
    <SectionContentGrid container>
      <LeftGutter item>{Icon && <Icon />}</LeftGutter>
      <SectionContent item>
        {title && (
          <Title variant="h3">
            {title}
            {author && <Author>by {author}</Author>}
          </Title>
        )}
        {subtitle && (
          <Subtitle variant="subtitle1">
            {subtitle}
            {author && <Author>by {author}</Author>}
          </Subtitle>
        )}
        {children}
      </SectionContent>
    </SectionContentGrid>
  );
}
