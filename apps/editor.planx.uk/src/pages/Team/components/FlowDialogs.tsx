import React from "react";

import { FlowSummary } from "../../FlowEditor/lib/store/editor";
import { ArchiveDialog } from "./ArchiveDialog";
import { CopyDialog } from "./CopyDialog";
import { useFlowActions } from "./hooks/useFlowActions";
import { RenameDialog } from "./RenameDialog";

interface FlowDialogsProps {
  flow: FlowSummary;
  teamSlug: string;
  refreshFlows: () => void;
}

export const FlowDialogs: React.FC<FlowDialogsProps> = ({
  flow,
  teamSlug,
  refreshFlows,
}) => {
  const {
    isArchiveDialogOpen,
    setIsArchiveDialogOpen,
    isCopyDialogOpen,
    isRenameDialogOpen,
    handleArchive,
    handleCopyDialogClose,
    handleRenameDialogClose,
  } = useFlowActions(flow, teamSlug, refreshFlows);

  return (
    <>
      {isArchiveDialogOpen && (
        <ArchiveDialog
          title={`Archive "${flow.name}"`}
          open={isArchiveDialogOpen}
          content={`Are you sure you want to archive "${flow.name}"? Once archived, a flow is no longer able to be viewed in the editor and can only be restored by a developer.`}
          onClose={() => setIsArchiveDialogOpen(false)}
          onConfirm={handleArchive}
          submitLabel="Archive this flow"
        />
      )}
      {isCopyDialogOpen && (
        <CopyDialog
          isDialogOpen={isCopyDialogOpen}
          handleClose={handleCopyDialogClose}
          sourceFlow={{
            name: flow.name,
            slug: flow.slug,
            id: flow.id,
          }}
        />
      )}
      {isRenameDialogOpen && (
        <RenameDialog
          isDialogOpen={isRenameDialogOpen}
          handleClose={handleRenameDialogClose}
          flow={{
            name: flow.name,
            slug: flow.slug,
            id: flow.id,
          }}
        />
      )}
    </>
  );
};
