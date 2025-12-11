import { useMutation, useQuery } from "@tanstack/react-query";
import { logger } from "airbrake";
import { AxiosError } from "axios";
import { checkForChanges, publishFlow } from "lib/api/publishFlow/requests";
import { PublishFlowArgs } from "lib/api/publishFlow/types";
import { useStore } from "pages/FlowEditor/lib/store";
import { formatLastPublishMessage } from "pages/FlowEditor/utils";

export const usePublishFlow = () => {
  const [flowId, lastPublished, lastPublisher] = useStore((state) => [
    state.id,
    state.lastPublished,
    state.lastPublisher,
  ]);

  const getLastPublished = async (flowId: string) => {
    const [date, user] = await Promise.all([
      lastPublished(flowId),
      lastPublisher(flowId),
    ]);
    return { date, user };
  };

  const lastPublishedQuery = useQuery({
    queryKey: ["lastPublished", flowId],
    queryFn: () => getLastPublished(flowId),
  });

  const checkForChangesMutation = useMutation({
    mutationKey: ["checkForChanges", flowId],
    mutationFn: () => checkForChanges(flowId),
  });

  const publishMutation = useMutation({
    mutationKey: ["publish", flowId],
    mutationFn: (args: PublishFlowArgs) => publishFlow({ flowId, ...args }),
    onSuccess: () => useStore.setState({ isFlowPublished: true }),
    onError: (error) => {
      if (error instanceof AxiosError) {
        alert(error.response?.data?.error);
        return logger.notify(error);
      }
      alert(
        `Error checking for changes to publish. Confirm that your graph does not have any corrupted nodes and that all nested flows are valid. \n${(error as Error).message}`,
      );
    },
  });

  /**
   * Calculate status based on publish queries and mutations
   * Order is significant - runs from highest priority to fallback statuses
   */
  const getStatus = (
    lastPublished: typeof lastPublishedQuery,
    checkForChanges: typeof checkForChangesMutation,
    publish: typeof publishMutation,
  ) => {
    if (publish.isPending) return "Publishing changes...";

    if (publish.isSuccess) {
      return publish.data.alteredNodes
        ? "Successfully published changes"
        : publish.data.message || "No new changes to publish";
    }

    if (checkForChanges.isSuccess) {
      return checkForChanges.data.message || "Found changes ready to publish";
    }

    if (publish.isError) return "Error trying to publish";
    if (checkForChanges.isError) return "Error checking for changes";
    if (lastPublished.isError) return " Error loading publish info";

    if (lastPublished.isPending) return "Loading last publish information...";
    if (lastPublished.data) {
      return formatLastPublishMessage(
        lastPublished.data.date,
        lastPublished.data.user,
      ).formatted;
    }

    return "This flow is not published yet";
  };

  const status = getStatus(
    lastPublishedQuery,
    checkForChangesMutation,
    publishMutation,
  );

  /**
   * Update publish button text based on state
   */
  const getButtonText = (checkForChanges: typeof checkForChangesMutation) => {
    if (checkForChanges.isPending) return "Checking for changes...";
    return "Check for changes to publish";
  };

  const buttonText = getButtonText(checkForChangesMutation);

  return {
    lastPublishedQuery,
    checkForChangesMutation,
    publishMutation,
    status,
    buttonText,
  };
};
