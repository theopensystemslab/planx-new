import { createFlow, getFlowData } from "../../../helpers.js";
import type { NewFlow } from "./controller.js";

const createFlowFromTemplate = async (
  templateId: string,
  { teamId, slug, name }: NewFlow,
): Promise<{ id: string; slug: string }> => {
  // Fetch the source template data
  const sourceTemplate = await getFlowData(templateId);

  // Create the new templated flow, including an associated operation and initial publish, and templated_from reference to the source templateId
  const { id } = await createFlow(
    teamId,
    slug,
    name,
    sourceTemplate.data,
    undefined, // flows.copied_from
    templateId
  );

  return { id, slug };
};

export { createFlowFromTemplate };
