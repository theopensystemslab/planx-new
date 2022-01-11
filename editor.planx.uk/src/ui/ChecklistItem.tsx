import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
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
  onChange: (checked: boolean) => void;
}

export default function ChecklistItem({
  label,
  onChange,
  checked,
  id,
}: Props): FCReturn {
  const classes = useClasses();

  const handleChange = (ev: React.MouseEvent<HTMLElement, MouseEvent>) => {
    // Prevent bubbling of event from label associated with checkbox
    ev.preventDefault();
    onChange(!checked);
  };

  return (
    <Box className={classes.root} onClick={(ev) => handleChange(ev)}>
      <Checkbox checked={checked} id={id} />
      <Typography variant="body2" className={classes.label}>
        <label htmlFor={id}>{label}</label>
      </Typography>
    </Box>
  );
}
