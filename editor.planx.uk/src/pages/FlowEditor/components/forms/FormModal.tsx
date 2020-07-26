import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Close from "@material-ui/icons/CloseOutlined";
import React, { useContext } from "react";
import { useNavigation } from "react-navi";
import { FlowContext } from "../..";
import { rootFlowPath } from "../../../../routes/utils";

const useStyles = makeStyles((theme) => ({
  closeButton: {
    float: "right",
    margin: 0,
    padding: 0,
    color: theme.palette.grey[600],
  },
}));

const FormModal: React.FC<{
  type: string;
  handleDelete?;
  Component: any;
}> = ({ type, handleDelete, Component }) => {
  const { navigate } = useNavigation();
  const classes = useStyles();
  const flow = useContext(FlowContext);
  console.log({ flow });

  return (
    <Dialog
      open
      fullWidth
      maxWidth="md"
      disableScrollLock
      onClose={() => {
        navigate(rootFlowPath(true));
      }}
    >
      <DialogTitle>
        {!handleDelete && (
          <select
            value={type}
            onChange={(e) => {
              const type = e.target.value;
              const url = new URL(window.location.href);
              url.searchParams.set("type", type);
              navigate([url.pathname, url.search].join(""));
            }}
          >
            <optgroup label="Question">
              <option value="question">Question</option>
              <option value="checklist">Checklist</option>
            </optgroup>
            <optgroup label="Inputs">
              <option disabled value="text-inputs">
                Text Input
              </option>
              <option disabled value="number-inputs">
                Number Input
              </option>
              <option disabled value="date-inputs">
                Date Input
              </option>
              <option disabled value="file-uploaders">
                File Upload
              </option>
              <option disabled value="address-inputs">
                Address Input
              </option>
            </optgroup>
            <optgroup label="Location">
              <option value="find-property">Find property</option>
              <option value="property-information">Property information</option>
            </optgroup>
            <optgroup label="Navigation">
              <option value="portal">Portal</option>
            </optgroup>
          </select>
        )}

        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={console.log}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Component
          handleSubmit={(e) => {
            e.preventDefault();
            flow.insertNode();
            navigate(rootFlowPath(true));
          }}
        />
      </DialogContent>
      <DialogActions>
        <Grid container justify="flex-end">
          {handleDelete && (
            <Grid item xs={6} sm={4} md={3}>
              <Button
                fullWidth
                size="large"
                onClick={() => {
                  handleDelete();
                  navigate(rootFlowPath(true));
                }}
              >
                Delete
              </Button>
            </Grid>
          )}
          <Grid item xs={6} sm={4} md={3}>
            <Button
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              color="primary"
              form="modal"
            >
              {handleDelete ? `Update ${type}` : `Create ${type}`}
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default FormModal;
