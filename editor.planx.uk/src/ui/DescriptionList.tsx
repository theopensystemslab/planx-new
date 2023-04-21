import { styled } from "@mui/material/styles";
import React, { Fragment } from "react";

interface DescriptionListItem {
  term: string;
  details?: string;
}

interface DescriptionListProps {
  data: DescriptionListItem[];
}

const List = styled("dl")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr 2fr",
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  "& > *": {
    borderBottom: "1px solid lightgrey",
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    verticalAlign: "top",
    margin: 0,
  },
}));

const Term = styled("dt")(() => ({
  // TODO: Standardise this from the theme
  fontWeight: 700,
}));

const Details = styled("dd")(() => ({
  paddingLeft: "10px",
}));

export const DescriptionList: React.FC<DescriptionListProps> = ({ data }) => (
  <List>
    {data.map(({ term, details }, index) => (
      <Fragment key={index}>
        <Term key={term}>{term}</Term>
        <Details key={details}>{details}</Details>
      </Fragment>
    ))}
  </List>
);
