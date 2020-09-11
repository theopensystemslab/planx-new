import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import React from "react";

export interface Props {
  onDelete?: () => void;
  onSave?: () => void;
}

const FormButtons: React.FC<Props> = (props) => {
  return (
    <Grid container justify="flex-end">
      <Grid item xs={6} sm={4} md={3}>
        <Button fullWidth size="large" onClick={props.onDelete}>
          Delete
        </Button>
      </Grid>
      <Grid item xs={6} sm={4} md={3}>
        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          color="primary"
          onClick={props.onSave}
        >
          Save
        </Button>
      </Grid>
    </Grid>
  );
};

export default FormButtons;
