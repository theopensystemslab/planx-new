import { BaseNodeData, parseBaseNodeData } from "../shared";

export interface SetFee extends BaseNodeData {
  operation: "calculateVAT" | "addServiceCharge" | "addFastTrackFee";
  fn: string;
  amount?: number;
}

export const parseSetFee = (data: Record<string, any> | undefined): SetFee => {
  const initialOperation = data?.operation || "calculateVAT";

  return {
    operation: initialOperation,
    fn: data?.fn || getDefaults(initialOperation).fn,
    amount: data?.amount || getDefaults(initialOperation)?.amount,
    ...parseBaseNodeData(data),
  };
};

export const getDefaults = (operation: SetFee["operation"]) => {
  switch (operation) {
    case "calculateVAT":
      return {
        fn: "",
      };
    case "addServiceCharge":
      return {
        fn: "application.fee.serviceCharge",
        amount: 30,
      };
    case "addFastTrackFee":
      return {
        fn: "application.fee.fastTrack",
      };
  }
};
