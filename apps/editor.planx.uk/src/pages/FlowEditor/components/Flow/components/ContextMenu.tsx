import ContentCutIcon from "@mui/icons-material/ContentCut";
import ContentPaste from "@mui/icons-material/ContentPaste";
import HelpTextIcon from "@mui/icons-material/Help";
import StickyNote2Icon from "@mui/icons-material/StickyNote2";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { ROOT_NODE_KEY } from "@planx/graph";
import { useNavigate, useParams } from "@tanstack/react-router";
import { DEFAULT_NOTE_COLOR } from "hooks/data/useFlowNodeNotes";
import { useStore } from "pages/FlowEditor/lib/store";
import {
  nodeIsChildOfTemplatedInternalPortal,
  nodeIsTemplatedInternalPortal,
} from "pages/FlowEditor/utils";
import * as React from "react";
import CloneIcon from "ui/icons/Clone";
import CopyIcon from "ui/icons/Copy";
import { getNodeRoute } from "utils/routeUtils/utils";

export type ContextMenuSource = "node" | "hanger" | "option" | null;

interface ContextMenuAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  disabled: boolean;
  onClick: () => void;
}

export interface ContextMenuPosition {
  mouseX: number;
  mouseY: number;
}

export const ContextMenu: React.FC = () => {
  const { team, flow: flowSlug } = useParams({
    from: "/_authenticated/app/$team/$flow",
  });
  const navigate = useNavigate();

  const [
    source,
    position,
    { self, parent = ROOT_NODE_KEY, before = undefined },
    closeMenu,
    clonedNodeId,
    copiedNode,
    copyNode,
    cloneNode,
    pasteNode,
    pasteClonedNode,
    cutNode,
    cutPayload,
    pasteCutNode,
    getNode,
    isTemplatedFrom,
    flow,
    orderedFlow,
    showHelpText,
    copyHelpText,
    getCopiedHelpText,
    pasteHelpText,
  ] = useStore((state) => [
    state.contextMenuSource,
    state.contextMenuPosition,
    state.contextMenuRelationships,
    state.closeContextMenu,
    state.getClonedNodeId(),
    state.getCopiedNode(),
    state.copyNode,
    state.cloneNode,
    state.pasteNode,
    state.pasteClonedNode,
    state.cutNode,
    state.getCutNode(),
    state.pasteCutNode,
    state.getNode,
    state.isTemplatedFrom,
    state.flow,
    state.orderedFlow,
    state.showHelpText,
    state.copyHelpText,
    state.getCopiedHelpText(),
    state.pasteHelpText,
  ]);

  const routeParent = parent === ROOT_NODE_KEY ? undefined : parent;

  const handleCopy = () => {
    if (!self)
      return alert(
        "Unable to copy, missing value for relationship 'self' (nodeId)",
      );

    copyNode(self);
    closeMenu();
  };

  const handleClone = () => {
    if (!self)
      return alert(
        "Unable to clone, missing value for relationship 'self' (nodeId)",
      );

    cloneNode(self);
    closeMenu();
  };

  const handleCut = () => {
    if (!self)
      return alert(
        "Unable to cut, missing value for relationship 'self' (nodeId)",
      );

    cutNode(self, parent);
    closeMenu();
  };

  const handleCopyHelp = () => {
    if (!self)
      return alert(
        "Unable to copy help text, missing value for relationship 'self' (nodeId)",
      );

    copyHelpText(self);
    closeMenu();
  };

  const handlePasteHelp = () => {
    if (!self) return;
    pasteHelpText(self);
    closeMenu();
  };

  const handleAttachNote = () => {
    if (!self) return;

    if (source === "option") {
      // Notes attached to options are stored as the first child of the option node
      const firstChildId = useStore.getState().flow[self]?.edges?.[0];
      navigate({
        to: firstChildId
          ? getNodeRoute(self, firstChildId)
          : getNodeRoute(self),
        params: {
          team,
          flow: flowSlug,
          parent: self,
          ...(firstChildId && { before: firstChildId }),
        },
        search: { type: "note", placement: "attached_to_option" },
      });
    } else {
      navigate({
        to: getNodeRoute(routeParent, self),
        params: {
          team,
          flow: flowSlug,
          ...(routeParent && { parent: routeParent }),
          before: self,
        },
        search: { type: "note", placement: "attached_to_node" },
      });
    }
    closeMenu();
  };

  const handleAddNote = () => {
    navigate({
      to: getNodeRoute(routeParent, before),
      params: {
        team,
        flow: flowSlug,
        ...(routeParent && { parent: routeParent }),
        ...(before && { before }),
      },
      search: { type: "note", placement: "before_node" },
    });
    closeMenu();
  };

  const handlePaste = () => {
    if (copiedNode) {
      pasteNode(parent, before);
      return closeMenu();
    }

    if (clonedNodeId) {
      pasteClonedNode(parent, before);
      return closeMenu();
    }

    if (cutPayload) {
      pasteCutNode(parent, before);
      return closeMenu();
    }
  };

  const anchorPosition = position
    ? { top: position.mouseY, left: position.mouseX }
    : undefined;

  // Define available actions based on source
  const getActions = (): ContextMenuAction[] => {
    const hasCopiedNode = Boolean(copiedNode);
    const hasClonedNode = Boolean(clonedNodeId && getNode(clonedNodeId));
    const hasCutNode = Boolean(cutPayload && getNode(cutPayload.rootId));
    const isPasteEnabled = hasCopiedNode || hasClonedNode || hasCutNode;

    // In templated flows, disable the copy/clone/cut context menus unless within a templated folder
    //   Since "hangers" are hidden in templated flows, isPasteEnabled doesn't need to be aware of isTemplatedFrom
    const indexedParent = orderedFlow?.find(({ id }) => id === parent);
    const parentIsTemplatedInternalPortal = nodeIsTemplatedInternalPortal(
      flow,
      indexedParent,
    );
    const parentIsChildOfTemplatedInternalPortal =
      nodeIsChildOfTemplatedInternalPortal(flow, indexedParent);

    const isTemplatedNodeContextMenuEnabled =
      parentIsTemplatedInternalPortal || parentIsChildOfTemplatedInternalPortal;

    if (source === "node") {
      const node = self ? getNode(self) : null;

      if (node?.type === TYPES.ExternalPortal) return [];

      const excludedTypes = [
        TYPES.Result,
        TYPES.Review,
        TYPES.PlanningConstraints,
        TYPES.Filter,
        TYPES.InternalPortal,
        TYPES.Section,
        TYPES.SetValue,
        TYPES.SetFee,
        TYPES.Send,
      ];

      const supportsHelpText = Boolean(
        showHelpText &&
        node &&
        node.type !== undefined &&
        !excludedTypes.includes(node.type),
      );
      const hasCopiedHelper = Boolean(getCopiedHelpText);

      const actions: ContextMenuAction[] = [
        {
          id: "copy",
          label: "Copy",
          icon: <CopyIcon fontSize="small" />,
          disabled: isTemplatedFrom
            ? !isTemplatedNodeContextMenuEnabled
            : false,
          onClick: handleCopy,
        },
        {
          id: "clone",
          label: "Clone",
          icon: <CloneIcon fontSize="small" />,
          disabled: isTemplatedFrom
            ? !isTemplatedNodeContextMenuEnabled
            : false,
          onClick: handleClone,
        },
        {
          id: "cut",
          label: "Cut",
          icon: <ContentCutIcon fontSize="small" />,
          disabled: isTemplatedFrom
            ? !isTemplatedNodeContextMenuEnabled
            : false,
          onClick: handleCut,
        },
      ];

      if (supportsHelpText) {
        actions.push({
          id: "copy-help",
          label: "Copy help text",
          icon: <HelpTextIcon fontSize="small" />,
          disabled: false,
          onClick: handleCopyHelp,
        });

        actions.push({
          id: "paste-help",
          label: "Paste help text",
          icon: <HelpTextIcon fontSize="small" />,
          disabled: !hasCopiedHelper,
          onClick: handlePasteHelp,
        });
      }

      return actions;
    }

    if (source === "hanger") {
      return [
        {
          id: "add-note",
          label: "Add note",
          icon: <StickyNote2Icon fontSize="small" />,
          disabled: false,
          onClick: handleAddNote,
        },
        {
          id: "paste",
          label: "Paste",
          icon: <ContentPaste fontSize="small" />,
          disabled: !isPasteEnabled,
          onClick: handlePaste,
        },
      ];
    }

    return [];
  };

  const showAttachNote = source === "node" || source === "option";

  const actions = getActions();

  return (
    <Menu
      open={Boolean(position)}
      onClose={closeMenu}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition}
    >
      <Paper sx={{ width: 320, maxWidth: "100%" }}>
        <MenuList dense>
          {showAttachNote && (
            <>
              <MenuItem
                onClick={handleAttachNote}
                sx={{
                  backgroundColor: DEFAULT_NOTE_COLOR,
                  "&:hover": { backgroundColor: "#f5f09e" },
                }}
              >
                <ListItemIcon>
                  <StickyNote2Icon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Attach note</ListItemText>
              </MenuItem>
              {actions.length > 0 && <Divider />}
            </>
          )}
          {actions.map((action) => (
            <MenuItem
              key={action.id}
              disabled={action.disabled}
              onClick={action.onClick}
            >
              <ListItemIcon>{action.icon}</ListItemIcon>
              <ListItemText>{action.label}</ListItemText>
            </MenuItem>
          ))}
        </MenuList>
      </Paper>
    </Menu>
  );
};
