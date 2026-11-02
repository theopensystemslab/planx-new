import type { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/material/styles";
import React, { Fragment } from "react";
import { FONT_WEIGHT_BOLD } from "theme";

export interface DescriptionListItem {
  term: string;
  details: React.ReactNode;
}

interface DescriptionListProps {
  data: DescriptionListItem[];
  sx?: SxProps<Theme>;
}

const List = styled("dl")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 2fr",
  "& > *": {
    borderBottom: "1px solid",
    borderColor: theme.palette.divider,
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    verticalAlign: "top",
    margin: 0,
  },
}));

const Term = styled("dt")(() => ({
  fontWeight: FONT_WEIGHT_BOLD,
}));

const Details = styled("dd")(() => ({
  paddingLeft: "10px",
}));

export const DescriptionList: React.FC<DescriptionListProps> = ({
  data,
  sx,
}) => (
  <List sx={sx}>
    {data.map(({ term, details }, index) => (
      <Fragment key={index}>
        <Term>{term}</Term>
        <Details>{details}</Details>
      </Fragment>
    ))}
  </List>
);
