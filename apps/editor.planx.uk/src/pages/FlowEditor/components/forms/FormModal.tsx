import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
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
import { type BaseNodeData, parseFormValues } from "@planx/components/shared";
import { useNavigate } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import ErrorFallback from "components/Error/ErrorFallback";
import { FormikProps } from "formik";
import isEqual from "lodash/isEqual";
import {
  nodeIsChildOfTemplatedInternalPortal,
  nodeIsTemplatedInternalPortal,
} from "pages/FlowEditor/utils";
import React, { useMemo, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { NodeSearchParams } from "routes/_authenticated/app/$team/$flow/_flowEditor/nodes/route";
import { Switch } from "ui/shared/Switch";
import { getNodeRoute } from "utils/routeUtils/utils";

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
  onChange: (newValue: TYPES) => void;
}> = (props) => {
  return (
    <TypeSelect
      value={fromSlug(props.value)}
      data-testid="header-select"
      onChange={(ev) => {
        props.onChange(ev.target.value as unknown as TYPES);
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

/**
 * TextInput and EnhancedTextInput are uniquely controlled via a toggle,
 * and not the standard Select component
 *
 * Component is styled to appears as an element within the child component
 */
const TextInputToggle: React.FC<{
  type: string;
  parent?: string;
  before?: string;
}> = ({ type, parent, before }) => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(type === "enhanced-text-input");
  const { flow, team } = useParams({ from: "/_authenticated/app/$team/$flow" });

  if (!["text-input", "enhanced-text-input"].includes(type)) return null;

  const toggleTextInput = () => {
    // Toggle visual state immediately without waiting for route change
    setChecked(!checked);

    const destinationType =
      type === "text-input" ? TYPES.EnhancedTextInput : TYPES.TextInput;

    navigate({
      to: getNodeRoute(parent, before),
      params: {
        team,
        flow,
        ...(parent && { parent }),
        ...(before && { before }),
      },
      search: (prev) => ({
        ...prev,
        type: SLUGS[destinationType] as NodeSearchParams["type"],
      }),
    });
  };

  return (
    <Box sx={{ position: "absolute", right: 82, top: 38, zIndex: 1 }}>
      <Switch
        label={
          <>
            <AutoAwesomeIcon sx={{ mr: 1 }} />
            AI Enhanced (testing only)
          </>
        }
        onChange={toggleTextInput}
        checked={checked}
      />
    </Box>
  );
};

interface FormModalProps {
  type: string;
  handleDelete?: () => void;
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
  handleDelete,
  id,
  before,
  parent,
  extraProps,
}) => {
  const navigate = useNavigate();
  const formikRef = useRef<FormikProps<BaseNodeData & unknown> | null>(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const { team: teamSlug, flow: flowSlug } = useParams({
    from: "/_authenticated/app/$team/$flow",
  });

  const [
    addNode,
    updateNode,
    flow,
    makeUnique,
    connect,
    isTemplatedFrom,
    orderedFlow,
    isClone,
  ] = useStore((store) => [
    store.addNode,
    store.updateNode,
    store.flow,
    store.makeUnique,
    store.connect,
    store.isTemplatedFrom,
    store.orderedFlow,
    store.isClone,
  ]);
  const node = id ? flow[id] : undefined;

  const normalizeFormValues = (obj: any): any => {
    if (obj === null || obj === undefined || obj === "") {
      return "";
    }

    if (Array.isArray(obj)) {
      return obj.map(normalizeFormValues);
    }

    if (typeof obj === "object") {
      const normalized: any = {};
      for (const key in obj) {
        normalized[key] = normalizeFormValues(obj[key]);
      }
      return normalized;
    }

    return obj;
  };

  const isDirty = (formik: FormikProps<BaseNodeData & unknown>): boolean => {
    return !isEqual(
      normalizeFormValues(formik.values),
      normalizeFormValues(formik.initialValues),
    );
  };

  const hasUnsavedChanges = () => {
    const formik = formikRef.current;
    if (!formik) return false;

    return isDirty(formik);
  };

  const handleClose = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedWarning(true);
    } else {
      navigate({
        to: "/app/$team/$flow",
        params: {
          team: teamSlug,
          flow: flowSlug,
        },
      });
    }
  };

  const handleConfirmClose = () => {
    setShowUnsavedWarning(false);
    navigate({
      to: "/app/$team/$flow",
      params: {
        team: teamSlug,
        flow: flowSlug,
      },
    });
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

  const showDeleteButton = id && !isDisabledTemplatedNode;

  const showMakeUniqueButton = useMemo(
    () => id && isClone(id) && !isDisabledTemplatedNode,
    [isClone, id, isDisabledTemplatedNode],
  );

  const disabled = isTemplatedFrom
    ? !canUserEditTemplatedNode
    : !canUserEditNode(teamSlug);

  const changeNodeType = (type: TYPES) => {
    navigate({
      to: getNodeRoute(parent, before),
      params: {
        team: teamSlug,
        flow: flowSlug,
        ...(parent && { parent }),
        ...(before && { before }),
      },
      search: (prev) => ({
        ...prev,
        type: SLUGS[type] as NodeSearchParams["type"],
      }),
    });
  };

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
            <NodeTypeSelect value={type} onChange={changeNodeType} />
          )}

          <CloseButton aria-label="close" onClick={handleClose} size="large">
            <Close />
          </CloseButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, position: "relative" }}>
          {!handleDelete && (
            <TextInputToggle type={type} parent={parent} before={before} />
          )}
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
                children:
                  | Array<Record<string, unknown>>
                  | undefined = undefined,
              ) => {
                // Handle internal portals
                if (typeof data === "string" && parent) {
                  connect(parent, data, { before });
                } else {
                  const parsedData = parseFormValues(Object.entries(data));
                  const parsedChildren =
                    children?.map((o) => parseFormValues(Object.entries(o))) ||
                    undefined;

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

                navigate({
                  to: "/app/$team/$flow",
                  params: { team: teamSlug, flow: flowSlug },
                });
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
                handleDelete && handleDelete();
                navigate({
                  to: "/app/$team/$flow",
                  params: {
                    team: teamSlug,
                    flow: flowSlug,
                  },
                });
              }}
              disabled={disabled}
              sx={{ backgroundColor: "background.default", gap: 1 }}
            >
              <DeleteIcon color="warning" fontSize="medium" />
              Delete
            </Button>
          )}
          <Box
            sx={{
              display: "flex",
              alignItems: "stretch",
              marginLeft: "auto",
            }}
            gap={1}
          >
            {showMakeUniqueButton && (
              <Button
                variant="contained"
                color="secondary"
                onClick={() => {
                  if (id) makeUnique(id, parent);
                  navigate({
                    to: "/app/$team/$flow",
                    params: {
                      team: teamSlug,
                      flow: flowSlug,
                    },
                  });
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
        maxWidth="md"
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
