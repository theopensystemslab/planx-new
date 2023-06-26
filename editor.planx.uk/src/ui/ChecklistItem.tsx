import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import * as React from "react";

import Checkbox from "./Checkbox";

export const useClasses = makeStyles((theme) => ({
  root: {
    width: "100%",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  label: {
    display: "flex",
    flexGrow: 2,
    "& > label": {
      cursor: "pointer",
      flexGrow: 2,
      padding: theme.spacing(0.75, 1.5),
    },
  },
}));

interface Props {
  id?: string;
  label: string;
  checked: boolean;
  onChange: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
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
      <Typography variant="body1" className={classes.label}>
        <label htmlFor={id}>{label}</label>
      </Typography>
    </Box>
  );
}
