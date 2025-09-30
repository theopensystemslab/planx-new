import ContentCopy from "@mui/icons-material/ContentCopy";
import ContentPaste from "@mui/icons-material/ContentPaste";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import { Relationships, ROOT_NODE_KEY } from "@planx/graph";
import { useStore } from "pages/FlowEditor/lib/store";
import * as React from "react";

export interface ContextMenuA11yProps {
  "aria-controls": "basic-menu" | undefined;
  "aria-haspopup": "true";
  "aria-expanded": "true" | undefined;
}

export interface ContextMenuPosition {
  mouseX: number;
  mouseY: number;
}

export type HandleContextMenu = (
  event: React.MouseEvent,
  relationships: Relationships,
) => void;

export const ContextMenu: React.FC = () => {
  const [
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
    if (copiedNode) pasteNode(parent, before);
    if (clonedNodeId) pasteClonedNode(parent, before);

    closeMenu();
  };

  const isPasteDisabled = Boolean(self || (!clonedNodeId && !copiedNode));

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
          <MenuItem disabled={!self} onClick={handleCopy}>
            <ListItemIcon>
              <ContentCopy fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy</ListItemText>
          </MenuItem>
          <MenuItem disabled={!self} onClick={handleClone}>
            <ListItemIcon>
              <ContentCopy fontSize="small" />
            </ListItemIcon>
            <ListItemText>Clone</ListItemText>
          </MenuItem>
          <MenuItem disabled={isPasteDisabled} onClick={handlePaste}>
            <ListItemIcon>
              <ContentPaste fontSize="small" />
            </ListItemIcon>
            <ListItemText>Paste</ListItemText>
          </MenuItem>
        </MenuList>
      </Paper>
    </Menu>
  );
};
