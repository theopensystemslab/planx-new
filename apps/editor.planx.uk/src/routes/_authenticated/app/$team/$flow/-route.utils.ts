import { notFound } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";
import {
  getBasicFlowData,
  getFlowEditorData,
} from "utils/routeUtils/queryUtils";

export async function connectToFlowRoute(teamSlug: string, rootFlow: string) {
  const store = useStore.getState();

  try {
    const flow = await getBasicFlowData(rootFlow, teamSlug);

    // ShareDB is already subscribed to this exact flow
    if (store.id === flow.id) return;

    // Ensure we only have a single active connection
    store.disconnectFromFlow();

    await store.connectToFlow(flow.id);
    useStore.setState({
      flowName: flow.name,
      flowSlug: rootFlow,
    });

    const flowEditorData = await getFlowEditorData(rootFlow, teamSlug);

    useStore.setState({
      id: flowEditorData.id,
      flowStatus: flowEditorData.flowStatus,
      isFlowPublished: flowEditorData.isFlowPublished,
      isTemplate: flowEditorData.isTemplate,
      isService: flowEditorData.isService,
      isTemplatedFrom: Boolean(flowEditorData.templatedFrom),
      template: flowEditorData.template,
    });

    if (flowEditorData.templatedFrom) {
      store.setOrderedFlow();
    }

    store.getFlowInformation(rootFlow, teamSlug);
  } catch (error) {
    console.error("[connectToFlowRoute] threw:", error);
    throw notFound();
  }
}
