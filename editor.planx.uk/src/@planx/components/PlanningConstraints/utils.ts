import { Constraint } from "@opensystemslab/planx-core/types";
import { InaccurateConstraints } from "./Public";
import { IntersectingConstraints } from "./model";

export function handleOverrides(
  fn: string,
  constraints: Record<string, Constraint> | Record<string, any>,
  inaccurateConstraints: InaccurateConstraints,
  intersectingConstraints: IntersectingConstraints,
  nots: IntersectingConstraints,
): { intersectingConstraints: IntersectingConstraints, nots: IntersectingConstraints } {
  if (inaccurateConstraints) {
    Object.entries(inaccurateConstraints).forEach(([inaccurateKey, inaccurateConstraint]) => {
      // Check if the whole constraint category (including any of its granular children) is now inapplicable
      const allEntitiesInaccurate = inaccurateConstraint.entities.length === constraints[inaccurateKey]["data"].length;
      if (allEntitiesInaccurate) {
        const inaccurateGranularKeys = intersectingConstraints[fn].filter((intersectingKey) => intersectingKey.startsWith(inaccurateKey));
        inaccurateGranularKeys.forEach((inaccurateGranularKey) => {
          nots[fn].push(inaccurateGranularKey);
        });
        intersectingConstraints[fn] = intersectingConstraints[fn].filter((intersectingKey) => !inaccurateGranularKeys.includes(intersectingKey));
      }

      // If less than all listed buildings or flood zones have been marked as inaccurate, ensure their granular children variables are correct
      if (!allEntitiesInaccurate && ["listed", "flood"].includes(inaccurateKey)) {
        // For each entity in this category marked as inaccurate, determine it's granular key
        const inaccurateGranularKeys: string[] = [];
        inaccurateConstraint["entities"].forEach((entityId) => {
          const inaccurateEntity = constraints[inaccurateKey]["data"].find((d: any) => d?.entity === parseInt(entityId));
          if (inaccurateEntity["listed-building-grade"]) {
            inaccurateGranularKeys.push(`listed.grade.${inaccurateEntity["listed-building-grade"]}`);
          } else if (inaccurateEntity["flood-risk-level"]) {
            inaccurateGranularKeys.push(`flood.zone.${inaccurateEntity["flood-risk-level"]}`);
          }
        });

        // For each entity in this category NOT marked as inaccurate, determine it's granular key
        const granularAccurateKeys: string[] = [];
        const accurateEntities = constraints[inaccurateKey]["data"].filter((d: any) => !inaccurateConstraint["entities"].includes(d?.entity?.toString()));
        accurateEntities.forEach((accurateEntity: any) => {
          if (accurateEntity["listed-building-grade"]) {
            granularAccurateKeys.push(`listed.grade.${accurateEntity["listed-building-grade"]}`);
          } else if (accurateEntity["flood-risk-level"]) {
            granularAccurateKeys.push(`flood.zone.${accurateEntity["flood-risk-level"]}`);
          }
        });

        // Remove any inaccurate keys that do NOT still apply to any remaining constraints
        const granularKeysToRemove = inaccurateGranularKeys.filter((k) => !granularAccurateKeys.includes(k));
        granularKeysToRemove?.forEach((k) => {
          intersectingConstraints[fn] = intersectingConstraints[fn].filter((intersectingKey) => intersectingKey !== k);
          nots[fn].push(k);
        });
      }
    });

    // Ensure "designated" land variable still has at least one applicable granular child, else remove it
    const hasOrphanedDesignatedKey = intersectingConstraints[fn].includes("designated") && intersectingConstraints[fn].filter((intersectingKey) => intersectingKey.startsWith("designated.")).length === 0;
    if (hasOrphanedDesignatedKey) {
      intersectingConstraints[fn] = intersectingConstraints[fn].filter((intersectingKey) => intersectingKey !== "designated");
      nots[fn].push("designated");
    }
  }

  return {
    intersectingConstraints: intersectingConstraints,
    nots: nots,
  };
}
