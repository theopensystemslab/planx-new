import ContentCutIcon from "@mui/icons-material/ContentCut";
import ContentPaste from "@mui/icons-material/ContentPaste";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import { ROOT_NODE_KEY } from "@planx/graph";
import { useStore } from "pages/FlowEditor/lib/store";
import * as React from "react";
import CloneIcon from "ui/icons/Clone";
import CopyIcon from "ui/icons/Copy";

export type ContextMenuSource = "node" | "hanger" | null;

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
  ]);

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

    if (source === "node") {
      return [
        {
          id: "copy",
          label: "Copy",
          icon: <CopyIcon fontSize="small" />,
          disabled: false,
          onClick: handleCopy,
        },
        {
          id: "clone",
          label: "Clone",
          icon: <CloneIcon fontSize="small" />,
          disabled: false,
          onClick: handleClone,
        },
        {
          id: "cut",
          label: "Cut",
          icon: <ContentCutIcon fontSize="small" />,
          disabled: false,
          onClick: handleCut,
        },
      ];
    }

    if (source === "hanger") {
      return [
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
