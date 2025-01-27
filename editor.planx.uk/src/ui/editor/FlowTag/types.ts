export const FlowTagType = {
  Status: "status",
  ApplicationType: "applicationType",
  ServiceType: "serviceType",
} as const;

export const StatusVariant = {
  Online: "online",
  Offline: "offline",
} as const;

type ObjectValues<T> = T[keyof T];

export type FlowTagType = ObjectValues<typeof FlowTagType>;

export type StatusVariant = ObjectValues<typeof StatusVariant>;

export interface FlowTagProps {
  tagType: FlowTagType;
  statusVariant?: StatusVariant;
  children?: React.ReactNode;
}
