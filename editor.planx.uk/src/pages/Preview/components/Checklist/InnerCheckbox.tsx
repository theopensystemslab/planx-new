import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import * as React from "react";

export const checkboxesStyles = makeStyles((theme) => ({
  checkBoxRoot: {
    borderRadius: 0,
    padding: 0,
    fontFamily: "inherit",
    display: "block",
    textAlign: "left",
    width: "100%",
    cursor: "pointer",
    fontSize: 15,
  },
  icon: {
    height: 32,
    width: 32,
    marginRight: theme.spacing(2),
    border: `1px solid ${theme.palette.text.primary}`,
    display: "block",
    position: "relative",
  },
  text: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    padding: 0,
  },
  withImage: {
    border: `1px solid ${theme.palette.background.paper}`,
    "& $text": {
      padding: theme.spacing(1.5),
      //backgroundColor: theme.palette.background.paper
    },
  },
  input: {
    position: "absolute",
    left: -10000,
    opacity: 0,
    "&:checked": {
      "& + label $icon": {
        "&::before": {
          content: "''",
          display: "block",
          position: "absolute",
          height: 18,
          width: 10,
          borderBottom: `2.5px solid ${theme.palette.text.primary}`,
          borderRight: `2.5px solid ${theme.palette.text.primary}`,
          left: "50%",
          top: "42%",
          transform: "translate(-50%, -50%) rotate(45deg)",
        },
      },
      "& + $withImage": {
        borderColor: theme.palette.text.primary,
      },
    },
  },
}));

interface ICheckbox {
  image?: JSX.Element;
  id?: string;
  label: string;
  value: string;
  changeCheckbox: Function;
  props?: any;
}

const Checkbox: React.FC<ICheckbox> = ({
  label,
  value,
  image,
  changeCheckbox,
  id,
  ...props
}) => {
  const classes = checkboxesStyles();
  const input = React.createRef<HTMLInputElement>();

  return (
    <Box mb={1}>
      <input
        value={value}
        className={classes.input}
        type="checkbox"
        ref={input}
        {...props}
      />
      <label
        className={classNames(classes.checkBoxRoot, image && classes.withImage)}
        htmlFor={id}
        onClick={() => changeCheckbox(input)}
      >
        {image && (
          <Box bgcolor="#fff" width="100%">
            {image}
          </Box>
        )}
        <Box className={classes.text}>
          <span className={classNames(classes.icon)} />
          {label}
        </Box>
      </label>
    </Box>
  );
};

export default Checkbox;
