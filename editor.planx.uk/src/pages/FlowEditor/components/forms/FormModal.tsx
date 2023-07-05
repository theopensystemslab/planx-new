import Close from "@mui/icons-material/CloseOutlined";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import { parseFormValues } from "@planx/components/shared";
import { TYPES } from "@planx/components/types";
import ErrorFallback from "components/ErrorFallback";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigation } from "react-navi";
import { rootFlowPath } from "routes/utils";

import { fromSlug, SLUGS } from "../../data/types";
import { useStore } from "../../lib/store";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  // Target all modal sections (the direct child is the backdrop, hence the double child selector)
  "& > * > *": {
    backgroundColor: theme.palette.grey[100],
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  float: "right",
  margin: 0,
  padding: 0,
  color: theme.palette.grey[600],
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
        <option value={TYPES.NextSteps}>Next steps</option>
      </optgroup>
      <optgroup label="Inputs">
        <option value={TYPES.TextInput}>Text Input</option>
        <option value={TYPES.FileUpload}>File Upload</option>
        <option value={TYPES.FileUploadAndLabel}>Upload and label</option>
        <option value={TYPES.NumberInput}>Number Input</option>
        <option value={TYPES.DateInput}>Date Input</option>
        <option value={TYPES.AddressInput}>Address Input</option>
        <option value={TYPES.ContactInput}>Contact Input</option>
      </optgroup>
      <optgroup label="Information">
        <option value={TYPES.TaskList}>Task List</option>
        <option value={TYPES.Notice}>Notice</option>
        <option value={TYPES.Result}>Result</option>
        <option value={TYPES.Content}>Content</option>
        <option value={TYPES.Review}>Review</option>
        <option value={TYPES.Confirmation}>Confirmation</option>
      </optgroup>
      <optgroup label="Location">
        <option value={TYPES.FindProperty}>Find property</option>
        <option value={TYPES.PropertyInformation}>Property information</option>
        <option value={TYPES.DrawBoundary}>Draw boundary</option>
        <option value={TYPES.PlanningConstraints}>Planning constraints</option>
      </optgroup>
      <optgroup label="Navigation">
        <option value={TYPES.Filter}>Filter</option>
        <option value={TYPES.InternalPortal}>Internal Portal</option>
        <option value={TYPES.ExternalPortal}>External Portal</option>
        <option value={TYPES.Section}>Section</option>
        <option value={TYPES.SetValue}>Set Value</option>
      </optgroup>
      <optgroup label="Payment">
        <option value={TYPES.Calculate}>Calculate</option>
        <option value={TYPES.Pay}>Pay</option>
      </optgroup>
      <optgroup label="Outputs">
        <option value={TYPES.Send}>Send</option>
      </optgroup>
    </select>
  );
};

const FormModal: React.FC<{
  type: string;
  handleDelete?: () => void;
  Component: any;
  node?: any;
  id?: any;
  before?: any;
  parent?: any;
  extraProps?: any;
}> = ({ type, handleDelete, Component, id, before, parent, extraProps }) => {
  const { navigate } = useNavigation();
  const [addNode, updateNode, node, makeUnique, connect] = useStore((store) => [
    store.addNode,
    store.updateNode,
    store.flow[id],
    store.makeUnique,
    store.connect,
  ]);
  const handleClose = () => navigate(rootFlowPath(true));

  return (
    <StyledDialog
      open
      fullWidth
      maxWidth="md"
      disableScrollLock
      onClose={handleClose}
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

        <CloseButton aria-label="close" onClick={handleClose} size="large">
          <Close />
        </CloseButton>
      </DialogTitle>
      <DialogContent dividers>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Component
            node={node}
            {...node?.data}
            {...extraProps}
            id={id}
            handleSubmit={(
              data: any,
              children: Array<any> | undefined = undefined
            ) => {
              if (typeof data === "string") {
                connect(parent, data, { before });
              } else {
                const parsedData = parseFormValues(Object.entries(data));
                const parsedChildren =
                  children?.map((o: any) =>
                    parseFormValues(Object.entries(o))
                  ) || undefined;

                if (handleDelete) {
                  updateNode(
                    { id, ...parsedData },
                    { children: parsedChildren }
                  );
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
        </ErrorBoundary>
      </DialogContent>
      <DialogActions sx={{ p: 0 }}>
        <Grid container justifyContent="flex-end">
          {handleDelete && (
            <Grid item xs={6} sm={4} md={3}>
              <Button
                fullWidth
                size="medium"
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
                size="medium"
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
              size="medium"
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
    </StyledDialog>
  );
};

export default FormModal;
