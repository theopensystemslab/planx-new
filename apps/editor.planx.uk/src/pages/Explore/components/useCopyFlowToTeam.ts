import { useNavigate } from "@tanstack/react-router";
import { useToast } from "hooks/useToast";
import { useStore } from "pages/FlowEditor/lib/store";
import {
  isUniquenessViolationError,
  useCreateFlow,
} from "pages/Flows/components/AddFlow/hooks/useCreateFlow";
import { slugify } from "utils";

export const useCopyFlowToTeam = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [
    teamId,
    teamSlug,
    showLoading,
    hideLoading,
    setLoadingCompleteCallback,
  ] = useStore((state) => [
    state.teamId,
    state.teamSlug,
    state.showLoading,
    state.hideLoading,
    state.setLoadingCompleteCallback,
  ]);

  const { mutate: createFlow, isPending } = useCreateFlow();

  const copyToTeam = (
    flow: { id: string; name: string },
    onDone?: () => void,
  ) => {
    const name = `${flow.name} (copy)`;

    setLoadingCompleteCallback(() => {
      toast.success("Flow created successfully");
      setLoadingCompleteCallback(undefined);
    });
    showLoading("Creating flow...");

    createFlow(
      {
        mode: "copy",
        flow: {
          sourceId: flow.id,
          teamId,
          name,
          slug: slugify(name),
        },
      },
      {
        onSuccess: async ({ flow: newFlow }) => {
          onDone?.();
          await navigate({
            to: "/app/$team/$flow",
            params: { team: teamSlug, flow: newFlow.slug },
          });
          hideLoading();
        },
        onError: (error) => {
          setLoadingCompleteCallback(undefined);
          hideLoading();
          if (isUniquenessViolationError(error)) {
            toast.error(
              `Your team already has a flow named "${name}", rename it and try again`,
            );
            return;
          }
          toast.error("Failed to add flow to your team");
        },
      },
    );
  };

  return { copyToTeam, isPending };
};
