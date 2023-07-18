import EastIcon from "@mui/icons-material/East";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import type { Step } from "@planx/components/NextSteps/model";
import React from "react";

const List = styled("ul")(({ theme }) => ({
  listStyle: "none",
  margin: theme.spacing(3, 0, 0, 0),
  padding: 0,
}));

const Step = styled("li")(({ theme }) => ({
  position: "relative",
  display: "flex",
  borderBottom: `1px solid ${theme.palette.secondary.main}`,
}));

const Inner = styled(Link)(({ theme }) => ({
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2, 0),
  textDecoration: "none",
  borderBottom: `1px solid theme.palette.text.secondary`,
  // Manually set hover and focus behaviours as we are doing something outside of the usual button style
  "&:hover > span": {
    backgroundColor: theme.palette.primary.dark,
  },
  "&:hover h2": {
    textDecorationThickness: "3px",
  },
  "&:focus > span": {
    backgroundColor: theme.palette.text.primary,
  },
  "&:focus h2": {
    textDecoration: "none",
  },
}));

const Description = styled(Typography)(() => ({}));

const ArrowButton = styled("span")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  width: "50px",
  height: "50px",
  flexShrink: "0",
}));

function ListItem(props: Step) {
  return (
    <Step>
      <Inner href={props.url}>
        <Box pr={2}>
          <Typography
            variant="h3"
            component="h2"
            mb={0.75}
            sx={{ textDecoration: "underline", textDecorationThickness: "1px" }}
          >
            {props.title}
          </Typography>
          <Description variant="body2" color="text.secondary">
            {props.description}
          </Description>
        </Box>
        <ArrowButton>
          <EastIcon />
        </ArrowButton>
      </Inner>
    </Step>
  );
}

function NextStepsList(props: { items: Step[] }) {
  return (
    <List>{props.items?.map((item, i) => <ListItem {...item} key={i} />)}</List>
  );
}

export default NextStepsList;
