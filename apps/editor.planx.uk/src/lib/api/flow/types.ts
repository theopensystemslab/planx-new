export type NewFlow = {
  slug: string;
  name: string;
  teamId: number;
  sourceId?: string;
  isTemplate?: boolean;
  isService?: boolean;
};

export interface CreateFlowResponse {
  id: string;
}
