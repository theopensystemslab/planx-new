export interface CopyDashboardParams {
  /** Metabase Dashboard ID, it is the number that follows /dashboard/ in the URL */
  dashboardId: number;
  /**  What the copied dashboard should be named;
   * should be the original dashboard name
   * but with 'Template' replaced with council name */
  name: string;
  /** Optional text to be displayed as the dashboard description */
  description?: string;
  /** Optional number for the copied dashboard's parent collection */
  collectionId?: number;
  /** Optional number for the copied dashboard's placement within the collection */
  collectionPosition?: number | null;
  /** Toggle whether or not the questions are copied as well;
   * Metabase deep-copies by default,
   * shallow = "Only duplicate the dashboard" */
  isDeepCopy?: boolean;
}
