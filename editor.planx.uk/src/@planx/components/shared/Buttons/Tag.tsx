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

const BG_ALERT = "#FAFF00";
const BG_ACTIVE = "#E5F1EB";
const BG_NOTICE = "#F3F2F1";

const useStyles = makeStyles((theme) => ({
  root: {
    fontSize: theme.typography.body2.fontSize,
    fontWeight: 600,
    width: "100%",
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(0.75),
    paddingLeft: theme.spacing(1.25),
    paddingRight: theme.spacing(1.25),
  },
  [TagType.Alert]: {
    color: theme.palette.text.primary,
    backgroundColor: BG_ALERT,
    "&:hover": {
      backgroundColor: darken(BG_ALERT, 0.05),
    },
  },
  [TagType.Active]: {
    backgroundColor: BG_ACTIVE,
    color: theme.palette.success.dark,
    "&:hover": {
      backgroundColor: darken(BG_ACTIVE, 0.05),
    },
  },
  [TagType.Notice]: {
    backgroundColor: BG_NOTICE,
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
