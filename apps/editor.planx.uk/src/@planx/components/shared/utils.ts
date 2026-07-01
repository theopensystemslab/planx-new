import {
  getValidSchemaValues,
  getValidSchemaValuesByEnumPath,
} from "@opensystemslab/planx-core";
import isNil from "lodash/isNil";

export const validateEmail = (email: string) => {
  const regex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line
  return regex.test(email);
};

export const squareMetresToHectares = (squareMetres: number): number => {
  return squareMetres / 10000; // 0.0001 hectares in 1 square metre
};

const isEmpty = (x: any) =>
  isNil(x) ||
  (Array.isArray(x) && x.length === 0) ||
  (typeof x === "string" && x.trim() === "") ||
  (typeof x === "object" && Object.keys(x).length === 0);

export const removeNilValues = <T extends Record<string, unknown>>(ob: T): T =>
  Object.entries(ob).reduce((acc, [k, v]) => {
    if (!isNil(v)) {
      (acc as Record<string, unknown>)[k] = v;
    }
    return acc;
  }, {} as T);

const fnOrDefaultPassportKey = (props: any) =>
  String(props.fn || props.id || Date.now());

/**
 * Helper method to return a value wrapped inside an object
 * that has data as the key
 *
 * { data: { [hardCodedKey || (props.fn|props.id|timestamp)]: value } }
 *
 * @param {*} props - object that should contain a value for .fn or .id
 * @param {*} value - the value to be assigned to the inner key/value pair
 * @param {string=} overwriteKey - if specified, this will be used as the key
 */
export const makeData = <T>(
  props: any,
  value: T,
  overwriteKey?: string,
): Record<string, never> | { data: Record<string, T> } => {
  if (isEmpty(value)) return {};

  return {
    data: { [overwriteKey ?? fnOrDefaultPassportKey(props)]: value },
  };
};

export const getPreviouslySubmittedData = ({
  id,
  fn,
  previouslySubmittedData,
}: {
  id?: string;
  fn?: string;
  previouslySubmittedData?: any;
}) => {
  const key = fn || id;
  const data = key && previouslySubmittedData?.data?.[key];

  return data;
};

export const clearOptionsDataFields = <T extends { data: { val?: string } }>(
  options: T[],
): T[] =>
  options.map((option) => ({ ...option, data: { ...option.data, val: "" } }));

export const getOptionsSchemaByFn = (
  fn?: string,
  defaultOptionsSchema?: string[],
  currentOptions?: (string | undefined)[],
) => {
  let schema = defaultOptionsSchema;

  // For certain data fields, suggest based on full ODP Schema enums rather than current flow schema
  //   Note that many `property.{}` fields which auto-suggest based on Planning Data entities set their schema one level up
  switch (fn) {
    case "applicant.type":
      schema = getValidSchemaValuesByEnumPath("BaseApplicant", "type");
      break;
    case "applicant.siteContact.role":
      // .concat() on user role is lazy manual handling of discriminated union enum type for BaseApplicant/SiteContact/Role !
      schema = getValidSchemaValuesByEnumPath("User", "role")?.concat("other");
      break;
    case "application.declaration.connection.form":
      schema = getValidSchemaValuesByEnumPath("Declaration", "connection");
      break;
    case "application.leadDeveloper":
      schema = getValidSchemaValuesByEnumPath("LeadDeveloper", "type");
      break;
    case "application.type":
      schema = getValidSchemaValues("ApplicationType");
      break;
    case "property.EPCKnown.form":
      schema = getValidSchemaValuesByEnumPath("LondonProperty", "EPC");
      break;
    case "property.occupation":
      schema = getValidSchemaValuesByEnumPath(
        "LondonProperty",
        "occupation",
        "status",
      );
      break;
    case "property.ownership.status":
      schema = getValidSchemaValuesByEnumPath(
        "LondonProperty",
        "ownership",
        "status",
      );
      break;
    case "property.titleNumberKnown.form":
      schema = getValidSchemaValuesByEnumPath("LondonProperty", "titleNumber");
      break;
    case "property.type":
      schema = getValidSchemaValues("PropertyType");
      break;
    case "proposal.cost.projected":
      schema = getValidSchemaValuesByEnumPath(
        "LondonProposal",
        "cost",
        "projected",
      );
      break;
    case "proposal.projectType":
      schema = getValidSchemaValues("ProjectType");
      break;
    case "user.role":
      schema = getValidSchemaValuesByEnumPath("User", "role");
      break;
  }

  // Ensure that any initial values outside of ODP Schema enums will still be recognised/pre-populated when modal loads
  currentOptions?.forEach((option) => {
    if (option && !schema?.includes(option)) {
      schema?.push(option);
    }
  });

  return schema;
};
