export interface ComponentGuideResponse {
  /** CommonMark rendering of the source Notion page's block tree */
  markdown: string;
  /** ISO timestamp of when the API's underlying Notion fetch ran */
  fetchedAt: string;
}
