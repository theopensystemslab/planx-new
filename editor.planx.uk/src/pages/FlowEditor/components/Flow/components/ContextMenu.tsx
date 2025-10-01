import ContentCopy from "@mui/icons-material/ContentCopy";
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
  ]);

  const handleCopy = () => {
    copyNode(self!);
    closeMenu();
  };

  const handleClone = () => {
    cloneNode(self!);
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
  };

  // Define available actions based on source
  const getActions = (): ContextMenuAction[] => {
    const hasCopiedContent = Boolean(clonedNodeId || copiedNode);

    if (source === "node") {
      return [
        {
          id: "copy",
          label: "Copy",
          icon: <ContentCopy fontSize="small" />,
          disabled: false,
          onClick: handleCopy,
        },
        {
          id: "clone",
          label: "Clone",
          icon: <ContentCopy fontSize="small" />,
          disabled: false,
          onClick: handleClone,
        },
      ];
    }

    if (source === "hanger") {
      return [
        {
          id: "paste",
          label: "Paste",
          icon: <ContentPaste fontSize="small" />,
          disabled: !hasCopiedContent,
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
      anchorPosition={
        position !== null
          ? { top: position.mouseY, left: position.mouseX }
          : undefined
      }
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
