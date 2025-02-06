import { createFlow, getFlowData } from "../../../helpers.js";

const createFlowFromTemplate = async (
  templateId: string,
  teamId: number,
): Promise<{ id: string; slug: string }> => {
  // Fetch the source template data
  const sourceTemplate = await getFlowData(templateId);

  const newSlug = sourceTemplate.name + "-template";
  const newName = sourceTemplate.name + " (template)";

  // Create the new templated flow, including an associated operation and initial publish, and templated_from reference to the source templateId
  const { id } = await createFlow(
    teamId,
    newSlug,
    newName,
    sourceTemplate.data,
    undefined, // flows.copied_from
    templateId,
  );

  return { id: id, slug: newSlug };
};

export { createFlowFromTemplate };
