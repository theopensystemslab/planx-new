import isNil from "lodash/isNil";

export const validateEmail = (email: string) => {
  const regex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // eslint-disable-line
  return regex.test(email);
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
): {} | { data: Record<string, T> } => {
  if (isEmpty(value)) return {};
  else
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
