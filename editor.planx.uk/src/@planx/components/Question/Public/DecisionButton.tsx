import Box from "@material-ui/core/Box";
import ButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import React from "react";

export const decisionButtonStyles = makeStyles((theme) => ({
  button: {
    transition: theme.transitions.create(["background-color"]),
    backgroundColor: theme.palette.background.paper,
    fontSize: 15,
    fontFamily: "inherit",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: "100%",
    textAlign: "left",
    position: "relative",
    height: "100%",
    paddingLeft: theme.spacing(5),
    marginBottom: theme.spacing(1),
  },
  decision: {
    minHeight: 200,
  },
  selected: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    "& $key": {
      color: theme.palette.text.secondary,
    },
    "&$decision $key": {
      color: theme.palette.primary.contrastText,
      opacity: 0.6,
    },
  },
  text: {
    paddingTop: theme.spacing(1.25),
    minHeight: theme.spacing(5),
  },
  key: {
    textAlign: "center",
    width: theme.spacing(5),
    height: theme.spacing(5),
    position: "absolute",
    left: 0,
    top: 0,
    color: theme.palette.text.secondary,
    lineHeight: `${theme.spacing(5)}px`,
  },
  description: {
    paddingLeft: theme.spacing(1),
  },
  onFocus: {
    outline: `2px solid ${theme.palette.secondary.light}`,
  },
}));

interface IDecisionButton {
  description?: string;
  responseKey: string;
  selected: boolean;
  onClick: Function;
}

const DecisionButton: React.FC<IDecisionButton> = ({
  description,
  responseKey,
  selected,
  children,
  ...props
}) => {
  const classes = decisionButtonStyles();
  return (
    <ButtonBase
      href=""
      className={classNames(
        classes.button,
        selected && classes.selected,
        description && classes.decision
      )}
      classes={{ focusVisible: classes.onFocus }}
      {...(props as any)}
    >
      <Box
        className={classes.key}
        bgcolor={!description ? "background.default" : "none"}
      >
        {responseKey}
      </Box>
      <Box
        className={classes.text}
        pl={description ? 1 : 2}
        pr={2}
        fontWeight={description ? 700 : 400}
      >
        {children}
      </Box>
      {description && (
        <Box className={classes.description} pb={3}>
          {description}
        </Box>
      )}
    </ButtonBase>
  );
};
export default DecisionButton;
