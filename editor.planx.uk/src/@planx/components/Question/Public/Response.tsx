import Box from "@material-ui/core/Box";
import ButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import classNames from "classnames";
import React from "react";

export const useStyles = makeStyles((theme) => ({
  button: {
    transition: theme.transitions.create(["background-color"]),
    backgroundColor: theme.palette.background.paper,
    fontSize: 15,
    fontFamily: "inherit",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    textAlign: "left",
    position: "relative",
    height: "100%",
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
  key: {
    opacity: 0.5,
  },
  description: {
    paddingLeft: theme.spacing(1),
  },
  onFocus: {
    outline: `2px solid ${theme.palette.secondary.light}`,
  },
}));

interface Props {
  response: {
    id: string;
    responseKey: string;
    title: string;
    description?: string;
  };
  selected: boolean;
  onClick: Function;
}

const Response: React.FC<Props> = ({ response, selected, ...props }) => {
  const classes = useStyles();
  return (
    <ButtonBase
      href=""
      className={classNames(classes.button, selected && classes.selected)}
      classes={{ focusVisible: classes.onFocus }}
      {...(props as any)}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flex={1}
        py={1}
        px={2}
      >
        <Typography variant="body2">{response.title}</Typography>
        <Box className={classes.key}>{response.responseKey.toUpperCase()}</Box>
      </Box>
    </ButtonBase>
  );
};

export function DescriptionResponse(props: Props) {
  const { response, selected } = props;
  const classes = useStyles();

  return (
    <ButtonBase
      href=""
      className={classNames(classes.button, selected && classes.selected)}
      classes={{ focusVisible: classes.onFocus }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flex={1}
        py={1}
        px={2}
      >
        <Typography variant="h6">{response.title}</Typography>
        <Typography variant="body2">
          {response.responseKey.toUpperCase()}
        </Typography>
      </Box>
      {/* <Typography>
          {response.description}
        </Typography> */}
    </ButtonBase>
  );
}

export default Response;
