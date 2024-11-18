export interface NewCollectionParams {
  /** The name of the new collection */
  name: string;
  description?: string;
  /** Optional; if the collection is a child of a parent, specify parent ID here
   * For council teams, parent collection should be 58
   */
  parent_id?: string;
  namespace?: string;
  authority_level?: null;
}
