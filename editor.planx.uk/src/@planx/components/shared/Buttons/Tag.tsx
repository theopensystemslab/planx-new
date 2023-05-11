import MuiButtonBase from "@mui/material/ButtonBase";
import { darken } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import classNames from "classnames";
import React from "react";

export enum TagType {
  Alert = "alert",
  Active = "active",
  Notice = "notice",
  Success = "success",
}

const useStyles = makeStyles((theme) => ({
  root: {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: 600,
    width: "100%",
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
  },
  [TagType.Alert]: {
    color: theme.palette.text.primary,
    backgroundColor: "#FAFF00",
    "&:hover": {
      backgroundColor: darken("#FAFF00", 0.05),
    },
  },
  [TagType.Active]: {
    backgroundColor: "#E8F1EC",
    color: theme.palette.success.dark,
    "&:hover": {
      backgroundColor: darken("#E8F1EC", 0.05),
    },
  },
  [TagType.Notice]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.secondary,
  },
  [TagType.Success]: {
    backgroundColor: theme.palette.success.dark,
    color: "#FFFFFF",
  },
}));

export interface Props {
  id?: string;
  className?: string;
  type: TagType;
  onClick: (event?: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  children?: React.ReactNode;
}

export default function Tag(props: Props): FCReturn {
  const { id, className, type, onClick, children } = props;
  const classes = useStyles();

  return (
    <MuiButtonBase
      href=""
      disabled={type == TagType.Notice || type == TagType.Success}
      className={classNames(classes.root, classes[type], className)}
      onClick={onClick}
      id={id}
    >
      {children}
    </MuiButtonBase>
  );
}
