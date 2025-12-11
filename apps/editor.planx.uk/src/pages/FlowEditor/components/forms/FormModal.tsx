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
import { useNavigate, useRouter } from "@tanstack/react-router";
import ErrorFallback from "components/Error/ErrorFallback";
import {
  nodeIsChildOfTemplatedInternalPortal,
  nodeIsTemplatedInternalPortal,
} from "pages/FlowEditor/utils";
import React, { useMemo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { NodeSearchParams } from "routes/_authenticated/$team/$flow/nodes/route";
import { rootFlowPath } from "utils/routeUtils/utils";

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

interface FormModalProps {
  type: string;

  Component: React.ComponentType<any>;
  node?: any;
  id?: string;
  before?: string;
  parent?: string;
  extraProps?: any;
}

const FormModal: React.FC<FormModalProps> = ({
  type,
  Component,
  id,
  before,
  parent,
  extraProps,
}) => {
  const navigate = useNavigate();
  const router = useRouter();
  const [
    addNode,
    updateNode,
    flow,
    makeUnique,
    connect,
    teamSlug,
    flowSlug,
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
    store.flowSlug,
    store.isTemplatedFrom,
    store.orderedFlow,
    store.isClone,
  ]);
  const node = id ? flow[id] : undefined;

  const handleClose = () => {
    navigate({
      to: "/$team/$flow",
      params: {
        team: teamSlug,
        flow: flowSlug,
      },
    });
  };

  const handleTypeChange = (newType: NodeSearchParams["type"]) => {
    navigate({
      to: router.latestLocation.pathname,
      search: { type: newType },
    });
  };

  const handleDelete = () => {
    if (!id || !parent) {
      console.error("Cannot delete node: id and parent are required");
      return;
    }
    useStore.getState().removeNode(id, parent);
    handleClose();
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

  const showDeleteButton = id && !isDisabledTemplatedNode;

  const showMakeUniqueButton = useMemo(
    () => id && isClone(id) && !isDisabledTemplatedNode,
    [isClone, id, isDisabledTemplatedNode],
  );

  const disabled = isTemplatedFrom
    ? !canUserEditTemplatedNode
    : !canUserEditNode(teamSlug);

  return (
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
        {!id && (
          <NodeTypeSelect
            value={type}
            onChange={(newType) => {
              handleTypeChange(
                SLUGS[Number(newType) as TYPES] as NodeSearchParams["type"],
              );
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
                if (parent) connect(parent, data, { before });
              } else {
                const parsedData = parseFormValues(Object.entries(data));
                const parsedChildren =
                  children?.map((o: any) =>
                    parseFormValues(Object.entries(o)),
                  ) || undefined;

                if (id) {
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
              handleClose();
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
                if (id && parent) {
                  makeUnique(id, parent);
                  navigate({ to: rootFlowPath(true) });
                }
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
            {id ? `Update` : `Create`}
          </Button>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

export default FormModal;
