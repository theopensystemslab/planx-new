import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import { useState } from "react";
import { StatusVariant } from "ui/editor/FlowTag/types";
import { slugify } from "utils";

export const useFlowActions = (
  flow: FlowSummary,
  teamSlug: string,
  refreshFlows: () => void,
) => {
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

  const [archiveFlow, moveFlow, canUserEditTeam] = useStore((state) => [
    state.archiveFlow,
    state.moveFlow,
    state.canUserEditTeam,
  ]);

  const toast = useToast();

  // Computed values
  const isSubmissionService = flow.publishedFlows?.[0]?.hasSendComponent;
  const isTemplatedFlow = Boolean(flow.templatedFrom);
  const isSourceTemplate = flow.isTemplate;
  const isAnyTemplate = isTemplatedFlow || isSourceTemplate;
  const statusVariant =
    flow.status === "online" ? StatusVariant.Online : StatusVariant.Offline;

  // Handlers
  const handleCopyDialogClose = () => {
    setIsCopyDialogOpen(false);
    refreshFlows();
  };

  const handleRenameDialogClose = () => {
    setIsRenameDialogOpen(false);
    refreshFlows();
  };

  const handleArchive = async () => {
    try {
      await archiveFlow(flow);
      refreshFlows();
      toast.success("Archived flow");
    } catch (error) {
      toast.error(
        "We are unable to archive this flow, refresh and try again or contact an admin",
      );
    }
  };

  const handleMove = (newTeam: string) => {
    moveFlow(flow.id, newTeam, flow.name).then(() => {
      refreshFlows();
    });
  };

  const handleMoveClick = () => {
    const newTeam = prompt("New team");
    if (newTeam) {
      if (slugify(newTeam) === teamSlug) {
        alert(`This flow already belongs to ${teamSlug}, skipping move`);
      } else {
        handleMove(slugify(newTeam));
      }
    }
  };

  // Menu items configuration
  const menuItems = [
    {
      label: "Rename",
      onClick: () => setIsRenameDialogOpen(true),
    },
    {
      label: "Copy",
      onClick: () => setIsCopyDialogOpen(true),
      disabled: isAnyTemplate,
    },
    {
      label: "Move",
      onClick: handleMoveClick,
    },
    {
      label: "Archive",
      onClick: () => setIsArchiveDialogOpen(true),
    },
  ];

  return {
    // State
    isArchiveDialogOpen,
    setIsArchiveDialogOpen,
    isCopyDialogOpen,
    setIsCopyDialogOpen,
    isRenameDialogOpen,
    setIsRenameDialogOpen,

    // Computed values
    isSubmissionService,
    isTemplatedFlow,
    isSourceTemplate,
    isAnyTemplate,
    statusVariant,

    // Handlers
    handleArchive,
    handleCopyDialogClose,
    handleRenameDialogClose,

    // Other
    menuItems,
    canUserEditTeam: canUserEditTeam(teamSlug),
  };
};
