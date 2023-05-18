import InputBase, { InputBaseProps } from "@mui/material/InputBase";
import { styled } from "@mui/material/styles";
import React from "react";

const PREFIX = "InputField";

const classes = {
  root: `${PREFIX}-root`,
  input: `${PREFIX}-input`,
  multiline: `${PREFIX}-multiline`,
};

const Root = styled(InputBase)(({ theme }) => ({
  [`& .${classes.root}`]: {
    backgroundColor: theme.palette.grey[100],
    transition: "background-color 0.2s ease-out",
    display: "block",
    width: "100%",
    padding: 0,
    "& + $inputRoot": {
      marginTop: theme.spacing(1),
    },
  },
  [`& .${classes.input}`]: {
    padding: theme.spacing(1),
  },
  [`& .${classes.multiline}`]: {
    padding: theme.spacing(1),
    "&$inputRoot": {
      padding: 0,
    },
  },
}));

interface Props extends InputBaseProps {}

export default function InputField(props: Props): FCReturn {
  return (
    <Root
      classes={{
        root: classes.root,
        input: classes.input,
        multiline: classes.multiline,
      }}
      {...props}
    />
  );
}
