import ContentCopy from "@mui/icons-material/ContentCopy";
import ContentPaste from "@mui/icons-material/ContentPaste";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import { NodeId } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";
import * as React from "react";

import { Relationships } from "..";

interface Props {
  nodeId?: NodeId;
  relationships: Relationships;
  open: boolean;
  handleClose: () => void;
  contextMenu: ContextMenuPosition | null;
}

export interface ContextMenuA11yProps {
  "aria-controls": "basic-menu" | undefined
  "aria-haspopup": "true"
  "aria-expanded": "true" | undefined
}

export interface ContextMenuPosition {
  mouseX: number;
  mouseY: number;
}

export type HandleContextMenu = (event: React.MouseEvent, relationships: Relationships) => void;

export const ContextMenu: React.FC<Props> = ({ 
  relationships: { nodeId, parent, before = undefined }, 
  open, 
  handleClose,
  contextMenu,
}) => {
  const [
    clonedNodeId, 
    copiedNode, 
    copyNode, 
    cloneNode, 
    pasteNode, 
    pasteClonedNode
  ] = useStore(state => [
    state.getClonedNodeId(), 
    state.getCopiedNode(), 
    state.copyNode, 
    state.cloneNode, 
    state.pasteNode, 
    state.pasteClonedNode
  ]);

  const handleCopy = () => {
    copyNode(nodeId!);
    handleClose();
  }

  const handleClone = () => {
    cloneNode(nodeId!);
    handleClose();
  }

  const handlePaste = () => {
    if (copiedNode) pasteNode(parent, before);
    if (clonedNodeId) pasteClonedNode(parent, before);

    handleClose();
  }

  const isPasteDisabled = Boolean(nodeId || (!clonedNodeId && !copiedNode));

  return (
    <Menu
      open={open}
      onClose={handleClose}
      anchorReference="anchorPosition"
      anchorPosition={
        contextMenu !== null
          ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
          : undefined
      }
    >
      <Paper sx={{ width: 320, maxWidth: "100%" }}>
        <MenuList dense>
          <MenuItem disabled={!nodeId} onClick={handleCopy}>
            <ListItemIcon>
              <ContentCopy fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy</ListItemText>
          </MenuItem>
          <MenuItem disabled={!nodeId} onClick={handleClone}>
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
}
