import Close from "@mui/icons-material/CloseOutlined";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { parseFormValues } from "@planx/components/shared";
import ErrorFallback from "components/Error/ErrorFallback";
import { useToast } from "hooks/useToast";
import { hasFeatureFlag } from "lib/featureFlags";
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useNavigation } from "react-navi";
import { rootFlowPath } from "routes/utils";

import { fromSlug, SLUGS } from "../../data/types";
import { Store, useStore } from "../../lib/store";

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
        <option value={TYPES.Checklist}>Checklist</option>
        {hasFeatureFlag("RESPONSIVE_QUESTIONS_CHECKLISTS") && (
          <option value={TYPES.ResponsiveChecklist}>
            Responsive checklist (testing only)
          </option>
        )}
        {hasFeatureFlag("RESPONSIVE_QUESTIONS_CHECKLISTS") && (
          <option value={TYPES.ResponsiveQuestion}>
            Responsive question (testing only)
          </option>
        )}
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
        <option value={TYPES.MapAndLabel}>Map and label (testing only)</option>
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
        <option value={TYPES.InternalPortal}>Internal portal</option>
        <option value={TYPES.ExternalPortal}>External portal</option>
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

const containsMadeLink = (data?: Record<string, unknown>): boolean => {
  if (!data) return false;

  return Object.values(data).some((value) => {
    if (typeof value !== "string") return false;

    const anchorTags = value.match(/<a[^>]*href=["'].*?["'][^>]*>/g);
    if (!anchorTags) return false;

    return anchorTags.some((anchorTag) => {
      const hrefMatch = anchorTag.match(/href=["'](.+?)["']/);
      if (!hrefMatch) return false;

      try {
        const url = new URL(hrefMatch[1]);
        const allowedHosts = ["legislation.gov.uk", "www.legislation.gov.uk"];
        return (
          allowedHosts.includes(url.hostname) && url.pathname.endsWith("/made")
        );
      } catch {
        return false;
      }
    });
  });
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
  const [
    addNode,
    updateNode,
    flow,
    makeUnique,
    connect,
    teamSlug,
    isTemplatedFrom,
    orderedFlow,
  ] = useStore((store) => [
    store.addNode,
    store.updateNode,
    store.flow,
    store.makeUnique,
    store.connect,
    store.getTeam().slug,
    store.isTemplatedFrom,
    store.orderedFlow,
  ]);
  const node = flow[id];
  const handleClose = () => navigate(rootFlowPath(true));

  // Nodes should be disabled when:
  //  1. The user doesn't have any edit access to this team
  //  2. The user has edit access to this team, but it is:
  //    - a templated flow
  //    - and the node itself is not marked "isTemplatedNode" or a descendent of an internal portal marked "isTemplatedNode"
  const canUserEditNode = (teamSlug: string) => {
    return useStore.getState().canUserEditTeam(teamSlug);
  };

  const indexedParent = orderedFlow?.find(({ id }) => id === parent);
  const parentIsTemplatedInternalPortal =
    indexedParent?.type === TYPES.InternalPortal &&
    Boolean(flow[indexedParent.id]?.data?.isTemplatedNode);
  const parentIsWithinTemplatedInternalPortal =
    indexedParent?.type === TYPES.InternalPortal &&
    indexedParent?.parentId &&
    Boolean(flow[indexedParent.parentId]?.data?.isTemplatedNode);

  const canUserEditTemplatedNode =
    canUserEditNode(teamSlug) &&
    (Boolean(node?.data?.isTemplatedNode) ||
      parentIsTemplatedInternalPortal ||
      parentIsWithinTemplatedInternalPortal);

  const disabled = isTemplatedFrom
    ? !canUserEditTemplatedNode
    : !canUserEditNode(teamSlug);

  const toast = useToast();

  return (
    <StyledDialog
      open
      fullWidth
      maxWidth="md"
      disableScrollLock
      onClose={handleClose}
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
            node={node}
            {...node?.data}
            {...extraProps}
            id={id}
            disabled={disabled}
            handleSubmit={(
              data: { data?: Record<string, unknown> },
              children: Array<any> | undefined = undefined,
            ) => {
              if (containsMadeLink(data.data)) {
                toast.error(
                  'Legislation GOV UK links incorrectly ending in "/made" detected in your content. Please fix before continuing.',
                );
                return;
              }
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
      <DialogActions sx={{ p: 0 }}>
        <Grid container justifyContent="flex-end">
          {handleDelete && !canUserEditTemplatedNode && (
            <Grid item xs={6} sm={4} md={3}>
              <Button
                fullWidth
                size="medium"
                onClick={() => {
                  handleDelete();
                  navigate(rootFlowPath(true));
                }}
                disabled={disabled}
              >
                delete
              </Button>
            </Grid>
          )}
          {handleDelete && !canUserEditTemplatedNode && (
            <Grid item xs={6} sm={4} md={3}>
              <Button
                fullWidth
                size="medium"
                onClick={() => {
                  makeUnique(id, parent);
                  navigate(rootFlowPath(true));
                }}
                disabled={disabled}
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
              disabled={disabled}
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
