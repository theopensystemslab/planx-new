import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import Caret from "ui/icons/Caret";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

const Panel = styled("li")(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  position: "relative",
  paddingBottom: theme.spacing(1.25),
}));

const NumberedListRoot = styled("ol")(() => ({
  listStyle: "none",
  margin: 0,
  padding: 0,
}));

const Summary = styled(ButtonBase)(({ theme }) => ({
  fontWeight: 700,
  minHeight: theme.spacing(6),
  padding: theme.spacing(2, 0),
  paddingLeft: theme.spacing(7),
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  [theme.breakpoints.up("sm")]: {},
}));

const Content = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  paddingLeft: theme.spacing(7),
  paddingRight: theme.spacing(2),
  lineHeight: 1.6,
  display: "block",
  [theme.breakpoints.up("sm")]: {
    paddingLeft: theme.spacing(13.5),
    paddingRight: theme.spacing(13.5),
  },
  "& p": {
    marginTop: 0,
    "&:last-child": {
      marginBottom: 0,
    },
  },
}));

interface StepIndicatorProps {
  isFirst: boolean;
  isLast: boolean;
}

const StepIndicator = styled(Box)<StepIndicatorProps>(
  ({ theme, isFirst, isLast }) => ({
    position: "absolute",
    width: theme.spacing(7),
    height: "100%",
    textAlign: "center",
    top: 0,
    left: 0,
    overflow: "hidden",
    [theme.breakpoints.up("sm")]: {
      paddingTop: theme.spacing(1.25),
      width: theme.spacing(13.5),
      textAlign: "left",
    },
    "&::after": {
      content: `''`,
      display: "block",
      width: 1,
      backgroundColor: "currentColor",
      height: isLast ? theme.spacing(4.5) : "100%",
      top: isFirst ? theme.spacing(4.5) : 0,
      position: "absolute",
      left: "48%",
      [theme.breakpoints.up("sm")]: {
        left: "16%",
      },
    },
    "& > i": {
      width: theme.spacing(4.5),
      height: theme.spacing(4.5),
      display: "inline-block",
      lineHeight: theme.spacing(4.5),
      border: `1px solid ${theme.palette.text.primary}`,
      backgroundColor: theme.palette.background.default,
      borderRadius: "50%",
      position: "relative",
      fontStyle: "normal",
      textAlign: "center",
      zIndex: 2,
      [theme.breakpoints.up("sm")]: {
        lineHeight: theme.spacing(4.5),
        width: theme.spacing(4.5),
        height: theme.spacing(4.5),
      },
    },
  })
);

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
interface Item {
  title: string;
  description: string;
}

function ListItem(
  props: Item & { index: number; isLast: boolean; heading?: HeadingLevel }
) {
  const [expanded, setExpanded] = React.useState(false);
  const handleChange = () => {
    setExpanded(!expanded);
  };
  return (
    <Panel>
      <StepIndicator isFirst={props.index === 0} isLast={props.isLast}>
        <i>{props.index + 1}</i>
      </StepIndicator>
      <Summary
        onClick={handleChange}
        aria-expanded={expanded}
        aria-controls={`group-${props.index}-content`}
      >
        <Box>
          <Typography
            variant="h5"
            component={props.heading || "h5"}
            id={`group-${props.index}-heading`}
          >
            {props.title}
          </Typography>
        </Box>
        <Caret
          expanded={expanded}
          titleAccess={expanded ? "Less Information" : "More Information"}
        />
      </Summary>
      {props.description && (
        <Collapse in={expanded}>
          <Content
            id={`group-${props.index}-content`}
            aria-labelledby={`group-${props.index}-heading`}
          >
            <ReactMarkdownOrHtml source={props.description} />
          </Content>
        </Collapse>
      )}
    </Panel>
  );
}

function NumberedList(props: { items: Item[]; heading?: HeadingLevel }) {
  return (
    <NumberedListRoot>
      {props.items?.map((item, i) => (
        <ListItem
          {...item}
          key={i}
          index={i}
          isLast={i === props.items.length - 1}
          heading={props.heading}
        />
      ))}
    </NumberedListRoot>
  );
}

export default NumberedList;
