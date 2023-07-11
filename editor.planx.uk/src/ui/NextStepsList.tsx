import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

const List = styled("ol")(({ theme }) => ({
  listStyle: "none",
  margin: theme.spacing(3, 0, 0, 0),
  padding: 0,
}));

const Step = styled("li")(({ theme }) => ({
  position: "relative",
}));

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
interface Item {
  title: string;
  description: string;
  url: string;
}

function ListItem(props: Item & { index: number; heading?: HeadingLevel }) {
  return (
    <Step>
      <Link href={props.url}>
        <Box>
          <Typography variant="h3" component={props.heading || "h5"}>
            {props.title}
          </Typography>
        </Box>
        <Typography variant="body2">{props.description}</Typography>
      </Link>
    </Step>
  );
}

function NextStepsList(props: { items: Item[]; heading?: HeadingLevel }) {
  return (
    <List>
      {props.items?.map((item, i) => (
        <ListItem {...item} key={i} index={i} heading={props.heading} />
      ))}
    </List>
  );
}

export default NextStepsList;
