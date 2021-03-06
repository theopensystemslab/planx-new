import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Collapse from "@material-ui/core/Collapse";
import { makeStyles } from "@material-ui/core/styles";
import { useFormik } from "formik";
import React, { useState } from "react";
import Input from "ui/Input";

export interface Props {
  children: JSX.Element[] | JSX.Element;
  onSubmit: (text: string) => void;
}

const useClasses = makeStyles((theme) => ({
  button: {
    color: theme.palette.text.primary,
  },
  submit: {
    marginTop: theme.spacing(2),
  },
}));

const CollapsibleForm: React.FC<Props> = (props: Props) => {
  const formik = useFormik({
    initialValues: {
      input: "",
    },
    onSubmit: (values) => {
      props.onSubmit(values.input);
    },
  });

  const [expanded, setExpanded] = useState(false);
  const classes = useClasses();

  return (
    <>
      <Button
        className={classes.button}
        onClick={() => setExpanded((x) => !x)}
        disableRipple
      >
        {props.children}
      </Button>
      <Collapse in={expanded}>
        <form onSubmit={formik.handleSubmit}>
          <Box
            bgcolor="background.paper"
            p={2}
            display="flex"
            flexDirection="column"
            alignItems="flex-end"
          >
            <Input
              multiline
              bordered
              value={formik.values.input}
              name="input"
              onChange={formik.handleChange}
            />
            <Button
              className={classes.submit}
              variant="contained"
              color="primary"
              type="submit"
            >
              Submit
            </Button>
          </Box>
        </form>
      </Collapse>
    </>
  );
};

export default CollapsibleForm;
