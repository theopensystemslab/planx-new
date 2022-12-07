import isNil from "lodash/isNil";
import { Store } from "pages/FlowEditor/lib/store";

import { bopsDictionary } from "../Send/bops";

export const validateEmail = (email: string) => {
  // eslint-disable-next-line
  let regex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
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
  overwriteKey?: string
): {} | { data: Record<string, T> } => {
  if (isEmpty(value)) return {};
  else
    return {
      data: { [overwriteKey ?? fnOrDefaultPassportKey(props)]: value },
    };
};

/**
 * Replaces a URL containing planx.uk with planx.dev
 * if the passport appears to contain test data.
 * Explanation: https://bit.ly/3AypxGW
 *
 * @example
 * useStagingUrlIfTestApplication(passport)("https://api.editor.planx.uk/test")
 * // when applicant's full name is 'Test Test'
 * // => "https://api.editor.planx.dev/test"
 * // otherwise
 * // => "https://api.editor.planx.uk/test"
 */
export const useStagingUrlIfTestApplication =
  (passport: Store.passport) => (urlThatMightBeReplaced: string) => {
    if (
      [
        passport.data?.[bopsDictionary.applicant_first_name],
        passport.data?.[bopsDictionary.applicant_last_name],
      ]
        .map((x) => String(x).toLowerCase().trim())
        .join("|") === "test|test"
    ) {
      const url = new URL(urlThatMightBeReplaced);
      url.hostname = url.hostname.replace("planx.uk", "planx.dev");
      return url.href;
    }

    return urlThatMightBeReplaced;
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
