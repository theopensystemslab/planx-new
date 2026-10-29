import { styled } from "@mui/material/styles";
import React, { Fragment } from "react";
import { FONT_WEIGHT_BOLD } from "theme";

export interface DescriptionListItem {
  term: string;
  details: React.ReactNode;
}

interface DescriptionListProps {
  data: DescriptionListItem[];
  hideLastBorder?: boolean;
}

const List = styled("dl")<{ hideLastBorder?: boolean }>(
  ({ theme, hideLastBorder }) => ({
    display: "grid",
    gridTemplateColumns: "1fr 2fr",
    "& > *": {
      borderBottom: "1px solid lightgrey",
      paddingBottom: theme.spacing(2),
      paddingTop: theme.spacing(2),
      verticalAlign: "top",
      margin: 0,
    },
    ...(hideLastBorder && {
      "& > *:nth-last-of-type(-n+1)": {
        borderBottom: "none",
      },
    }),
  }),
);

const Term = styled("dt")(() => ({
  fontWeight: FONT_WEIGHT_BOLD,
}));

const Details = styled("dd")(() => ({
  paddingLeft: "10px",
}));

export const DescriptionList: React.FC<DescriptionListProps> = ({
  data,
  hideLastBorder,
}) => (
  <List hideLastBorder={hideLastBorder}>
    {data.map(({ term, details }, index) => (
      <Fragment key={index}>
        <Term>{term}</Term>
        <Details>{details}</Details>
      </Fragment>
    ))}
  </List>
);
