import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import Caret from "ui/icons/Caret";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

const STEP_DIAMETER = "45px";
const STEP_SPACER = "60px";

const List = styled("ol")(({ theme }) => ({
  listStyle: "none",
  margin: theme.spacing(3, 0, 0, 0),
  padding: 0,
}));

const Panel = styled("li")(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  position: "relative",
  "&::after": {
    content: "''",
    position: "absolute",
    width: `calc(100% - ${STEP_SPACER})`,
    height: "1px",
    background: theme.palette.secondary.main,
    bottom: "0",
    left: STEP_SPACER,
  },
  // Offset top of vertical border for first indicator in list
  "&:first-of-type > div::after": {
    top: STEP_DIAMETER,
  },
  // Shorten height of vertical border for last indicator in list
  "&:last-of-type > div::after": {
    height: STEP_DIAMETER,
  },
}));

const Summary = styled(ButtonBase)(({ theme }) => ({
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  minHeight: STEP_SPACER,
  padding: theme.spacing(2, 1, 2, 0),
  paddingLeft: STEP_SPACER,
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
}));

const Content = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  paddingTop: theme.spacing(1.5),
  paddingBottom: theme.spacing(3),
  paddingLeft: STEP_SPACER,
  paddingRight: theme.spacing(2),
  display: "block",
  "& p": {
    marginTop: 0,
    "&:last-child": {
      marginBottom: 0,
    },
  },
}));

const StepIndicator = styled(Box)(({ theme }) => ({
  position: "absolute",
  width: STEP_DIAMETER,
  height: "100%",
  textAlign: "center",
  top: 0,
  left: 0,
  overflow: "hidden",
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  pointerEvents: "none",
  "&::after": {
    content: `''`,
    display: "block",
    width: 2,
    backgroundColor: "currentColor",
    height: "100%",
    top: 0,
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
  },
}));

const StepNumber = styled("i")(({ theme }) => ({
  width: STEP_DIAMETER,
  height: STEP_DIAMETER,
  display: "inline-block",
  lineHeight: theme.spacing(4.25),
  border: `2px solid ${theme.palette.text.primary}`,
  backgroundColor: theme.palette.background.default,
  borderRadius: "50%",
  position: "relative",
  fontStyle: "normal",
  textAlign: "center",
  zIndex: 2,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
}));

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
interface Item {
  title: string;
  description: string;
}

function ListItem(props: Item & { index: number; heading?: HeadingLevel }) {
  const [expanded, setExpanded] = React.useState(false);
  const handleChange = () => {
    setExpanded(!expanded);
  };
  return (
    <Panel>
      <StepIndicator>
        <StepNumber>{props.index + 1}</StepNumber>
      </StepIndicator>
      <Summary
        onClick={handleChange}
        aria-expanded={expanded}
        aria-controls={`group-${props.index}-content`}
        disableRipple
        disableTouchRipple
      >
        <Box>
          <Typography
            variant="h3"
            component={props.heading || "h5"}
            id={`group-${props.index}-heading`}
            align="left"
          >
            {props.title}
          </Typography>
        </Box>
        <Caret
          expanded={expanded}
          titleAccess={expanded ? "Less Information" : "More Information"}
          color="primary"
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
    <List>
      {props.items?.map((item, i) => (
        <ListItem {...item} key={i} index={i} heading={props.heading} />
      ))}
    </List>
  );
}

export default NumberedList;
