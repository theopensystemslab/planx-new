import { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import { slugify } from "utils";

export const getUniqueFlow = (
  name: string,
  flows: FlowSummary[],
): { slug: string; name: string } | undefined => {
  const newFlowSlug = slugify(name);
  const duplicateFlowName = flows?.find((flow) => flow.slug === newFlowSlug);

  if (duplicateFlowName) {
    const updatedName = prompt(
      `A service already exists with the name '${name}', enter another name`,
      name,
    );
    if (!updatedName) return;
    return getUniqueFlow(updatedName, flows);
  }
  return { slug: newFlowSlug, name: name };
};
