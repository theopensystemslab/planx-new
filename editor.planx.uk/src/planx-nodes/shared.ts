export interface MoreInformation {
  howMeasured?: string;
  policyRef?: string;
  info?: string;
  notes?: string;
  definitionImg?: string;
}

export const parseMoreInformation = (
  data: Record<string, any> | undefined
): MoreInformation => ({
  notes: data?.notes,
  definitionImg: data?.definitionImg,
  howMeasured: data?.howMeasured,
  policyRef: data?.policyRef,
  info: data?.info,
});

export interface Option {
  val?: string;
  description?: string;
  id?: string;
  flag?: string;
  text?: string;
  img?: string;
}
