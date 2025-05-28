import {
  activePlanningConstraints,
  type DigitalLandConstraint,
  type MinimumDigitalLandEntitiesResponse,
  type PlanxConstraint,
  type PlanxMetadata,
} from "@opensystemslab/planx-core/types";
import fetch from "isomorphic-fetch";

const getActivePlanningDataConstraints = (): Record<
  string,
  DigitalLandConstraint
> => {
  const activePlanningConstraintsCopy = activePlanningConstraints;
  delete activePlanningConstraintsCopy["roads.classified"];

  return activePlanningConstraintsCopy as Record<string, DigitalLandConstraint>;
};

const fetchConstraintsFromPlanningData = async (
  geom: string,
  activeDatasets: string[],
): Promise<{ res: MinimumDigitalLandEntitiesResponse; url: string }> => {
  // Set up request query params per https://www.planning.data.gov.uk/docs
  const options = {
    entries: "current",
    geometry: geom,
    geometry_relation: "intersects",
    exclude_field: "geometry,point",
    limit: "100", // TODO handle pagination in future for large polygons & many datasets, but should be well within this limit now
  };
  // 'dataset' param is not array[string] per docs, instead re-specify param name per unique dataset
  const datasets = `&dataset=${[...new Set(activeDatasets)].join(`&dataset=`)}`;

  // Fetch records from digital land, will return '{ count: 0, entities: [], links: {..} }' if no intersections
  const url = `https://www.planning.data.gov.uk/entity.json?${new URLSearchParams(
    options,
  )}${datasets}`;
  const res = await fetch(url)
    .then((response: { json: () => any }) => response.json())
    .catch((error: any) => console.log(error));

  return { res, url };
};

const fetchMetadataFromPlanningData = async (
  activeDatasets: string[],
  baseSchema: Record<string, DigitalLandConstraint>,
): Promise<PlanxMetadata> => {
  const metadata: PlanxMetadata = {};
  const urls = activeDatasets.map(
    (dataset) => `https://www.planning.data.gov.uk/dataset/${dataset}.json`,
  );

  await Promise.all(
    urls.map((url) =>
      fetch(url)
        .then((response: { json: () => any }) => response.json())
        .catch((error: any) => console.log(error)),
    ),
  )
    .then((responses) => {
      responses.forEach((response: any) => {
        // Get the Planx variable that corresponds to this 'dataset', should never be null because we only requested known datasets
        const key = Object.keys(baseSchema).find((key) =>
          baseSchema[key]["digital-land-datasets"]?.includes(response.dataset),
        );
        if (key) metadata[key] = response;
      });
    })
    .catch((error) => console.log(error));

  return metadata;
};

const addIntersections = (
  digitalLandRes: MinimumDigitalLandEntitiesResponse,
  baseSchema: Record<string, DigitalLandConstraint>,
  result: PlanxConstraint,
): PlanxConstraint => {
  digitalLandRes.entities.forEach((entity) => {
    // Get the planx variable that corresponds to this entity's 'dataset', should never be null because our initial request is filtered on 'dataset'
    const key = Object.keys(baseSchema).find((key) =>
      baseSchema[key]["digital-land-datasets"]?.includes(entity.dataset),
    );
    // Because there can be many digital land datasets per planx variable, check if this key is already in our result
    if (key && Object.keys(result).includes(key)) {
      result[key]["data"]?.push(entity);
    } else {
      if (key) {
        result[key] = {
          fn: key,
          value: true,
          text: baseSchema[key].pos,
          data: [entity],
          category: baseSchema[key].category,
        };
      }
    }
  });

  return result;
};

const addNots = (
  activeDataValues: string[],
  baseSchema: Record<string, DigitalLandConstraint>,
  result: PlanxConstraint,
): PlanxConstraint => {
  const nots = Object.keys(baseSchema).filter(
    (key) =>
      activeDataValues.includes(key) && !Object.keys(result).includes(key),
  );

  nots.forEach((not) => {
    result[not] = {
      fn: not,
      value: false,
      text: baseSchema[not].neg,
      category: baseSchema[not].category,
    };
  });

  return result;
};

// Adds "designated" variable to result object, so we can auto-answer less granular questions like "are you on designated land"
const addDesignatedVariable = (result: PlanxConstraint): PlanxConstraint => {
  const resultWithDesignated: PlanxConstraint = {
    ...result,
    designated: {
      value: false,
    },
  };

  const subVariables = ["conservationArea", "AONB", "nationalPark", "WHS"];

  // If any of the subvariables are true, then set "designated" to true
  subVariables.forEach((s) => {
    if (resultWithDesignated[`designated.${s}`]?.value) {
      resultWithDesignated["designated"] = {
        value: true,
      };
    }
  });

  // Ensure that our result includes all the expected subVariables before returning "designated"
  //   so we don't incorrectly auto-answer any questions for individual layer queries that may have failed
  let subVariablesFound = 0;
  Object.keys(result).forEach((key) => {
    if (key.startsWith(`designated.`)) {
      subVariablesFound++;
    }
  });

  if (subVariablesFound < subVariables.length) {
    return result;
  } else {
    return resultWithDesignated;
  }
};

const setGranularNationalPark = (
  baseSchema: Record<string, DigitalLandConstraint>,
  result: PlanxConstraint,
): PlanxConstraint => {
  const broads = "designated.nationalPark.broads";

  if (
    result["designated.nationalPark"] &&
    result["designated.nationalPark"].value
  ) {
    result["designated.nationalPark"]?.data?.forEach((entity: any) => {
      if (
        baseSchema[broads]["digital-land-entities"]?.includes(entity.entity)
      ) {
        result[broads] = {
          fn: broads,
          value: true,
          text: baseSchema[broads].pos,
        };
      }
    });
  } else {
    // Only add the granular variable if the response already includes the parent one
    if (result["designated.nationalPark"])
      result[broads] = { fn: broads, value: false };
  }

  return result;
};

const addFloodZone = (result: PlanxConstraint): PlanxConstraint => {
  const zoneLookup: Record<string, string> = {
    "flood.zone.2": "flood.zoneTwo",
    "flood.zone.3": "flood.zoneThree",
  };

  if (result["flood"] && result["flood"].value) {
    Object.keys(zoneLookup).forEach(
      (oldZone) =>
        (result[zoneLookup[oldZone]] = {
          fn: zoneLookup[oldZone],
          value: Boolean(
            result["flood"].data?.filter(
              (entity) =>
                entity["flood-risk-level"] === oldZone.split(".").pop(),
            ).length,
          ),
        }),
    );
  }

  return result;
};

const addListedBuildingGrade = (result: PlanxConstraint): PlanxConstraint => {
  const gradeLookup: Record<string, string> = {
    "listed.grade.I": "listed.gradeOne",
    "listed.grade.II": "listed.gradeTwo",
    "listed.grade.II*": "listed.gradeTwoStar",
  };

  if (result["listed"] && result["listed"].value) {
    Object.keys(gradeLookup).forEach(
      (oldGrade) =>
        (result[gradeLookup[oldGrade]] = {
          fn: gradeLookup[oldGrade],
          value: Boolean(
            result["listed"].data?.filter(
              (entity) =>
                entity["listed-building-grade"] === oldGrade.split(".").pop(),
            ).length,
          ),
        }),
    );
  }

  return result;
};

const addArticle4s = (
  a4s: Record<string, string>,
  result: PlanxConstraint,
): PlanxConstraint => {
  // Loop through any intersecting a4 data entities and set granular planx values based on this local authority's schema
  result["articleFour"]?.data?.forEach((entity: any) => {
    Object.keys(a4s)?.forEach((key) => {
      if (
        // These are various ways we link source data to granular Planx values (see local_authorities/metadata for specifics)
        entity.name.replace(/\r?\n|\r/g, " ") === a4s[key] ||
        entity.reference === a4s[key] ||
        entity?.["article-4-direction"] === a4s[key] ||
        entity?.notes === a4s[key] ||
        entity?.description?.startsWith(a4s[key]) ||
        result[key]?.value // If this granular var is already true, make sure it remains true
      ) {
        result[key] = { fn: key, value: true };
      } else {
        result[key] = { fn: key, value: false };
      }
    });
  });

  return result;
};

const renameArticle4CAZ = (
  localAuthority: string,
  baseSchema: Record<string, DigitalLandConstraint>,
  result: PlanxConstraint,
): PlanxConstraint => {
  const customTeamSlugs: Record<string, string> = {
    "barking-and-dagenham": "barkingAndDagenham",
    "epsom-and-ewell": "epsomAndEwell",
    "st-albans": "stAlbans",
    "west-berkshire": "westBerkshire",
  };

  const localCaz = Object.keys(customTeamSlugs).includes(localAuthority)
    ? `articleFour.${customTeamSlugs[localAuthority]}.caz`
    : `articleFour.${localAuthority}.caz`;

  if (result["articleFour.caz"]) {
    result[localCaz] = result["articleFour.caz"];
    delete result["articleFour.caz"];

    // If caz is true, but parent a4 is false, sync parent a4 for accurate granularity
    if (result[localCaz]?.value && !result["articleFour"]?.value) {
      result["articleFour"] = {
        fn: "articleFour",
        value: true,
        text: baseSchema["articleFour"].pos,
        data: result[localCaz].data,
        category: baseSchema["articleFour"].category,
      };
    }
  }

  return result;
};

export {
  addArticle4s,
  addDesignatedVariable,
  addFloodZone,
  addIntersections,
  addListedBuildingGrade,
  addNots,
  getActivePlanningDataConstraints,
  fetchConstraintsFromPlanningData,
  fetchMetadataFromPlanningData,
  renameArticle4CAZ,
  setGranularNationalPark,
};
