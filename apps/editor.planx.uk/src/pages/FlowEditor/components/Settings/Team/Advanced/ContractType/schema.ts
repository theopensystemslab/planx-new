import { mixed, object, type SchemaOf } from "yup";

import type { ContractFormValues, ContractType } from "./types";
import { CONTRACT_VALUES } from "./types";

export const validationSchema: SchemaOf<ContractFormValues> = object().shape({
  contract: mixed<ContractType>()
    .oneOf([...CONTRACT_VALUES])
    .required(),
});

export const defaultValues: ContractFormValues = {
  contract: "with_sc",
};
