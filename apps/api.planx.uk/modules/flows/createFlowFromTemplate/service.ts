import isNull from "lodash/isNull.js";

import { createFlow, getFlowData } from "../../../helpers.js";
import type { NewFlow } from "./controller.js";

const createFlowFromTemplate = async (
  templateId: string,
  { teamId, slug, name }: NewFlow,
): Promise<{ id: string; slug: string }> => {
  // Fetch the source template data
  const sourceTemplate = await getFlowData(templateId);

  // Create the new templated flow, including an associated operation and initial publish, and templated_from reference to the source templateId
  //   The templated flow should also inherit the readme info of the source template
  const { id } = await createFlow({
    teamId,
    slug,
    name,
    isTemplate: false,
    flowData: sourceTemplate.data,
    templatedFrom: templateId,
    summary: isNull(sourceTemplate.summary)
      ? undefined
      : sourceTemplate.summary,
    description: isNull(sourceTemplate.description)
      ? undefined
      : sourceTemplate.description,
    limitations: isNull(sourceTemplate.limitations)
      ? undefined
      : sourceTemplate.limitations,
  });

  return { id, slug };
};

export { createFlowFromTemplate };
