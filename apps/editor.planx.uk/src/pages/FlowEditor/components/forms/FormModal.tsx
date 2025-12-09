import Close from "@mui/icons-material/CloseOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { parseFormValues } from "@planx/components/shared";
import ErrorFallback from "components/Error/ErrorFallback";
import { FormikProps } from "formik";
import {
  nodeIsChildOfTemplatedInternalPortal,
  nodeIsTemplatedInternalPortal,
} from "pages/FlowEditor/utils";
import React, { useMemo, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigation } from "react-navi";
import { rootFlowPath } from "routes/utils";

import { fromSlug, SLUGS } from "../../data/types";
import { useStore } from "../../lib/store";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  // Target all modal sections (the direct child is the backdrop, hence the double child selector)
  "& > * > *": {
    backgroundColor: theme.palette.background.paper,
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  margin: "0 0 0 auto",
  padding: theme.spacing(1),
  color: theme.palette.grey[600],
}));

const TypeSelect = styled("select")(() => ({
  fontSize: "1em",
  padding: "0.25em",
}));

const NodeTypeSelect: React.FC<{
  value: string;
  onChange: (newValue: string) => void;
}> = (props) => {
  return (
    <TypeSelect
      value={fromSlug(props.value)}
      data-testid="header-select"
      onChange={(ev) => {
        props.onChange(ev.target.value);
      }}
    >
      <optgroup label="Question">
        <option value={TYPES.Question}>Question</option>
        <option value={TYPES.ResponsiveQuestion}>Responsive question</option>
        <option value={TYPES.Checklist}>Checklist</option>
        <option value={TYPES.ResponsiveChecklist}>Responsive checklist</option>
        <option value={TYPES.NextSteps}>Next steps</option>
      </optgroup>
      <optgroup label="Inputs">
        <option value={TYPES.TextInput}>Text input</option>
        <option value={TYPES.FileUpload}>File upload</option>
        <option value={TYPES.FileUploadAndLabel}>Upload and label</option>
        <option value={TYPES.NumberInput}>Number input</option>
        <option value={TYPES.DateInput}>Date input</option>
        <option value={TYPES.AddressInput}>Address input</option>
        <option value={TYPES.ContactInput}>Contact input</option>
        <option value={TYPES.List}>List</option>
        <option value={TYPES.Page}>Page</option>
        <option value={TYPES.MapAndLabel}>Map and label</option>
        <option value={TYPES.Feedback}>Feedback</option>
      </optgroup>
      <optgroup label="Information">
        <option value={TYPES.TaskList}>Task list</option>
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
        <option value={TYPES.ExternalPortal}>Flow</option>
        <option value={TYPES.InternalPortal}>Folder</option>
        <option value={TYPES.Section}>Section</option>
        <option value={TYPES.SetValue}>Set value</option>
      </optgroup>
      <optgroup label="Payment">
        <option value={TYPES.Calculate}>Calculate</option>
        <option value={TYPES.SetFee}>Set fees</option>
        <option value={TYPES.Pay}>Pay</option>
      </optgroup>
      <optgroup label="Outputs">
        <option value={TYPES.Send}>Send</option>
      </optgroup>
    </TypeSelect>
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
  const formikRef = useRef<FormikProps<any> | null>(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const [
    addNode,
    updateNode,
    flow,
    makeUnique,
    connect,
    teamSlug,
    isTemplatedFrom,
    orderedFlow,
    isClone,
  ] = useStore((store) => [
    store.addNode,
    store.updateNode,
    store.flow,
    store.makeUnique,
    store.connect,
    store.getTeam().slug,
    store.isTemplatedFrom,
    store.orderedFlow,
    store.isClone,
  ]);
  const node = flow[id];

  const handleClose = () => {
    if (formikRef.current?.dirty) {
      setShowUnsavedWarning(true);
    } else {
      navigate(rootFlowPath(true));
    }
  };

  const handleConfirmClose = () => {
    setShowUnsavedWarning(false);
    navigate(rootFlowPath(true));
  };

  const handleCancelClose = () => {
    setShowUnsavedWarning(false);
  };

  // Nodes should be disabled when:
  //  1. The user doesn't have any edit access to this team
  //  2. The user has edit access to this team, but it is:
  //    - a templated flow
  //    - and the node itself is not marked "isTemplatedNode" or a child of an internal portal marked "isTemplatedNode"
  const canUserEditNode = (teamSlug: string) => {
    return useStore.getState().canUserEditTeam(teamSlug);
  };

  const indexedParent = orderedFlow?.find(({ id }) => id === parent);
  const parentIsTemplatedInternalPortal = nodeIsTemplatedInternalPortal(
    flow,
    indexedParent,
  );
  const parentIsChildOfTemplatedInternalPortal =
    nodeIsChildOfTemplatedInternalPortal(flow, indexedParent);

  const canUserEditTemplatedNode =
    canUserEditNode(teamSlug) &&
    (Boolean(node?.data?.isTemplatedNode) ||
      parentIsTemplatedInternalPortal ||
      parentIsChildOfTemplatedInternalPortal);

  const isDisabledTemplatedNode =
    isTemplatedFrom &&
    Boolean(node?.data?.isTemplatedNode) &&
    (!parentIsTemplatedInternalPortal ||
      !parentIsChildOfTemplatedInternalPortal);

  const showDeleteButton = handleDelete && !isDisabledTemplatedNode;

  const showMakeUniqueButton = useMemo(
    () => isClone(id) && !isDisabledTemplatedNode,
    [isClone, id, isDisabledTemplatedNode],
  );

  const disabled = isTemplatedFrom
    ? !canUserEditTemplatedNode
    : !canUserEditNode(teamSlug);

  return (
    <>
      <StyledDialog
        open
        fullWidth
        disableScrollLock
        onClose={(_event, reason) => {
          if (reason === "escapeKeyDown") {
            handleClose();
          }
        }}
      >
        <DialogTitle
          sx={{
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
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
        <DialogContent dividers sx={{ p: 0 }}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Component
              formikRef={formikRef}
              node={node}
              {...node?.data}
              {...extraProps}
              id={id}
              disabled={disabled}
              handleSubmit={(
                data: { data?: Record<string, unknown> },
                children: Array<any> | undefined = undefined,
              ) => {
                // Handle internal portals
                if (typeof data === "string") {
                  connect(parent, data, { before });
                } else {
                  const parsedData = parseFormValues(Object.entries(data));
                  const parsedChildren =
                    children?.map((o: any) =>
                      parseFormValues(Object.entries(o)),
                    ) || undefined;

                  if (handleDelete) {
                    updateNode(
                      { id, ...parsedData },
                      { children: parsedChildren },
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
        <DialogActions
          disableSpacing
          sx={{ justifyContent: "flex-start", alignItems: "stretch" }}
        >
          {showDeleteButton && (
            <Button
              color="secondary"
              variant="contained"
              onClick={() => {
                handleDelete();
                navigate(rootFlowPath(true));
              }}
              disabled={disabled}
              sx={{ backgroundColor: "background.default", gap: 1 }}
            >
              <DeleteIcon color="warning" fontSize="medium" />
              Delete
            </Button>
          )}
          <Box
            sx={{ display: "flex", alignItems: "stretch", marginLeft: "auto" }}
            gap={1}
          >
            {showMakeUniqueButton && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  makeUnique(id, parent);
                  navigate(rootFlowPath(true));
                }}
                disabled={disabled}
                sx={{ backgroundColor: "background.default" }}
              >
                Make unique
              </Button>
            )}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              form="modal"
              disabled={disabled}
            >
              {handleDelete ? `Update` : `Create`}
            </Button>
          </Box>
        </DialogActions>
      </StyledDialog>
      <Dialog
        open={showUnsavedWarning}
        onClose={handleCancelClose}
        aria-labelledby="unsaved-changes-dialog-title"
        aria-describedby="unsaved-changes-dialog-description"
      >
        <DialogTitle
          id="unsaved-changes-dialog-title"
          variant="h3"
          component="h1"
        >
          Unsaved changes
        </DialogTitle>
        <DialogContent dividers>
          <Box id="unsaved-changes-dialog-description">
            You have unsaved changes. Are you sure you want to close without
            saving?
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCancelClose}
            variant="contained"
            color="secondary"
            sx={{ backgroundColor: "background.default" }}
          >
            Continue editing
          </Button>
          <Button
            onClick={handleConfirmClose}
            variant="contained"
            color="warning"
          >
            Discard changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FormModal;
