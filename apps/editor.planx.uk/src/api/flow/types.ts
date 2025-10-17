export type NewFlow = {
  slug: string;
  name: string;
  teamId: number;
  sourceId?: string;
  isTemplate?: boolean;
};

export interface CreateFlowResponse {
  id: string;
}
