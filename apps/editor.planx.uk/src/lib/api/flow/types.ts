export type NewFlow = {
  slug: string;
  name: string;
  teamId: number;
  sourceId?: string;
  isTemplate?: boolean;
  isService?: boolean;
  isPattern?: boolean;
};

export interface CreateFlowResponse {
  id: string;
}
