import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { styled } from "@mui/material/styles";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

interface Props {
  title?: string;
  children?: JSX.Element[] | JSX.Element;
  author?: string;
  Icon?: any;
}

const SectionContentGrid = styled(Grid)(({ theme }) => ({
  position: "relative",
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  wrap: "no-wrap",
}));

const LeftGutter = styled(Grid)(({ theme }) => ({
  flex: `0 0 ${theme.spacing(6)}`,
  textAlign: "center",
}));

const SectionContent = styled(Grid)(({ theme }) => ({
  flexGrow: 1,
  paddingRight: theme.spacing(6),
}));

const Title = styled(Box)(({ theme }) => ({
  opacity: 0.75,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  fontSize: 18,
  paddingBottom: theme.spacing(2),
}));

const Author = styled("span")(({ theme }) => ({
  fontWeight: 400,
  color: theme.palette.text.secondary,
}));

export default function ModalSectionContent({
  title,
  children,
  author,
  Icon,
}: Props): FCReturn {
  return (
    <SectionContentGrid container>
      <LeftGutter item>{Icon && <Icon />}</LeftGutter>
      <SectionContent item>
        {title && (
          <Title>
            {title}
            {author && <Author>by {author}</Author>}
          </Title>
        )}
        {children}
      </SectionContent>
    </SectionContentGrid>
  );
}
