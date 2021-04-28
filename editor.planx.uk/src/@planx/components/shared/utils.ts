import isNil from "lodash/isNil";

export const validateEmail = (email: string) => {
  // eslint-disable-next-line
  let regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
};

const fnOrDefaultPassportKey = (props: any) =>
  String(props.fn ?? props.id ?? Date.now());

export const makeData = (props: any, data: any, hardCodedKey?: string) => {
  if (isNil(data)) return {};
  else
    return {
      data: { [hardCodedKey ?? fnOrDefaultPassportKey(props)]: data },
    };
};
