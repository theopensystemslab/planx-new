import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import * as React from "react";

import Checkbox from "./Checkbox";

export const useClasses = makeStyles((theme) => ({
  root: {
    width: "100%",
    cursor: "pointer",
    marginBottom: theme.spacing(1.5),
    paddingRight: theme.spacing(1),
    display: "inline-flex",
    alignItems: "center",
  },
  label: {
    marginLeft: theme.spacing(1.5),
    "& > label": {
      cursor: "pointer",
    },
  },
}));

interface Props {
  id?: string;
  label: string;
  checked: boolean;
  onChange: (event?: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

export default function ChecklistItem({
  label,
  onChange,
  checked,
  id,
}: Props): FCReturn {
  const classes = useClasses();

  return (
    <Box className={classes.root}>
      <Checkbox checked={checked} id={id} onChange={onChange} />
      <Typography variant="body2" className={classes.label}>
        <label htmlFor={id}>{label}</label>
      </Typography>
    </Box>
  );
}
