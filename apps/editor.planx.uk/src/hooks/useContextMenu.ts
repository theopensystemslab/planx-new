import { Relationships } from "@planx/graph";
import { ContextMenuSource } from "pages/FlowEditor/components/Flow/components/ContextMenu";
import { useStore } from "pages/FlowEditor/lib/store";
import { MouseEventHandler } from "react";

interface Props {
  relationships: Relationships;
  source: NonNullable<ContextMenuSource>;
}

/**
 * Open a context menu which contains a series of node or hanger based actions
 */
export const useContextMenu = ({ relationships, source }: Props) => {
  const openContextMenu = useStore((state) => state.openContextMenu);

  const handler: MouseEventHandler = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const position = {
      mouseX: event.clientX + 2,
      mouseY: event.clientY - 6,
    };

    openContextMenu(position, relationships, source);
  };

  return handler;
};
