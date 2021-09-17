import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { SPACE_BAR } from "@planx/components/shared/constants";
import classNames from "classnames";
import * as React from "react";

import Checkbox from "./Checkbox";

export const useClasses = makeStyles((theme) => ({
  labelRoot: {
    borderRadius: 0,
    padding: 0,
    fontFamily: "inherit",
    display: "block",
    textAlign: "left",
    width: "100%",
    cursor: "pointer",
    fontSize: 15,
    marginBottom: 12,
  },
  text: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    padding: 0,
  },
  label: {
    marginLeft: theme.spacing(1.5),
  },
  input: {
    position: "absolute",
    left: -10000,
    opacity: 0,
    "&:focus-visible": {
      outline: `2px solid ${theme.palette.secondary.dark}`,
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
  ...props
}: Props): FCReturn {
  const classes = useClasses();
  const input = React.createRef<HTMLInputElement>();

  const handleChange = () => {
    onChange(!checked);
  };

  return (
    <Box mb={0.5}>
      <input
        onChange={() => {
          handleChange();
        }}
        checked={checked}
        className={classes.input}
        type="checkbox"
        tabIndex={-1}
        ref={input}
        id={id}
        {...props}
      />
      <label
        className={classNames(classes.labelRoot)}
        htmlFor={id}
        onKeyDown={(e) => {
          if (e.key === SPACE_BAR) {
            handleChange();
          }
        }}
      >
        <Box className={classes.text}>
          <Checkbox checked={checked} />
          <Typography variant="body2" className={classes.label}>
            {label}
          </Typography>
        </Box>
      </label>
    </Box>
  );
}
