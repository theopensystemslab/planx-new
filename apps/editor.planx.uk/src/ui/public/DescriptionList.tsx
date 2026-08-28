import { styled } from "@mui/material/styles";
import React, { Fragment } from "react";

export interface DescriptionListItem {
  term: string;
  details: string;
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
  // TODO: Standardise this from the theme
  fontWeight: 700,
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
        <Term key={term}>{term}</Term>
        <Details key={details}>{details}</Details>
      </Fragment>
    ))}
  </List>
);
