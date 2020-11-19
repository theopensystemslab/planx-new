import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Close from "@material-ui/icons/CloseOutlined";
import { parseFormValues } from "@planx/components/shared";
import { TYPES } from "@planx/components/types";
import React from "react";
import { useNavigation } from "react-navi";

import { rootFlowPath } from "../../../../routes/utils";
import { fromSlug, SLUGS } from "../../data/types";
import { useStore } from "../../lib/store";

const useStyles = makeStyles((theme) => ({
  dialog: {
    // Target all modal sections (the direct child is the backdrop, hence the double child selector)
    "& > * > *": {
      backgroundColor: theme.palette.grey[100],
    },
  },
  closeButton: {
    float: "right",
    margin: 0,
    padding: 0,
    color: theme.palette.grey[600],
  },
  actions: {
    padding: 0,
  },
}));

const NodeTypeSelect: React.FC<{
  value: string;
  onChange: (newValue: string) => void;
}> = (props) => {
  return (
    <select
      value={fromSlug(props.value)}
      onChange={(ev) => {
        props.onChange(ev.target.value);
      }}
    >
      <optgroup label="Question">
        <option value={TYPES.Statement}>Question</option>
        <option value={TYPES.Checklist}>Checklist</option>
      </optgroup>
      <optgroup label="Inputs">
        <option value={TYPES.TextInput}>Text Input</option>
        <option value={TYPES.FileUpload}>File Upload</option>
        <option disabled value="number-inputs">
          Number Input
        </option>
        <option value={TYPES.DateInput}>Date Input</option>
        <option disabled value="address-inputs">
          Address Input
        </option>
      </optgroup>
      <optgroup label="Information">
        <option value={TYPES.TaskList}>Task List</option>
        <option value={TYPES.Notice}>Notice</option>
        <option value={TYPES.Result}>Result</option>
        <option value={TYPES.Content}>Content</option>
        <option value={TYPES.Review}>Review</option>
      </optgroup>
      <optgroup label="Location">
        <option value={TYPES.FindProperty}>Find property</option>
        <option value={TYPES.PropertyInformation}>Property information</option>
      </optgroup>
      <optgroup label="Navigation">
        <option value={TYPES.Filter}>Filter</option>
        <option value={TYPES.InternalPortal}>Internal Portal</option>
        <option value={TYPES.ExternalPortal}>External Portal</option>
        <option value={TYPES.Page}>Page</option>
      </optgroup>
      <optgroup label="Payment">
        <option value={TYPES.Pay}>Pay</option>
      </optgroup>
    </select>
  );
};

const FormModal: React.FC<{
  type: string;
  handleDelete?;
  Component: any;
  node?: any;
  id?: any;
  before?: any;
  parent?: any;
  extraProps?: any;
}> = ({ type, handleDelete, Component, id, before, parent, extraProps }) => {
  const { navigate } = useNavigation();
  const classes = useStyles();
  const [addNode, updateNode, node, makeUnique, connect] = useStore((store) => [
    store.addNode,
    store.updateNode,
    store.flow[id],
    store.makeUnique,
    store.connect,
  ]);
  const handleClose = () => navigate(rootFlowPath(true));

  return (
    <Dialog
      open
      fullWidth
      maxWidth="md"
      disableScrollLock
      onClose={handleClose}
      className={classes.dialog}
    >
      <DialogTitle>
        {!handleDelete && (
          <NodeTypeSelect
            value={type}
            onChange={(type) => {
              const url = new URL(window.location.href);
              url.searchParams.set("type", SLUGS[Number(type) as TYPES]);
              navigate([url.pathname, url.search].join(""));
            }}
          />
        )}

        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={handleClose}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Component
          node={node}
          {...node?.data}
          {...extraProps}
          id={id}
          handleSubmit={(data, children = undefined) => {
            if (typeof data === "string") {
              connect(parent, data, { before });
            } else {
              const parsedData = parseFormValues(Object.entries(data));
              const parsedChildren =
                children?.map((o) => parseFormValues(Object.entries(o))) ||
                undefined;

              if (handleDelete) {
                updateNode({ id, ...parsedData }, { children: parsedChildren });
              } else {
                addNode(parsedData, {
                  children: parsedChildren,
                  parent,
                  before,
                });
              }
            }

            navigate(rootFlowPath(true));
          }}
        />
      </DialogContent>
      <DialogActions className={classes.actions}>
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
                delete
              </Button>
            </Grid>
          )}
          {handleDelete && (
            <Grid item xs={6} sm={4} md={3}>
              <Button
                fullWidth
                size="large"
                onClick={() => {
                  makeUnique(id, parent);
                  navigate(rootFlowPath(true));
                }}
              >
                make unique
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
