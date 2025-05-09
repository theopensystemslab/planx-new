export const updateTemplatedFlowEdits = async (
  flowId: string,
  templatedFrom: string,
  data: any,
) => {
  // TODO
  // 1. Fetch flows.data where id = templatedFrom
  // 2. JSON diff against event `data`
  // 3. Filter diff for nodes tagged 'customisation'
  // 4. Transform diff to `templated_flow_edits` data shape
  // 5. Update `templated_flow_edits`

  return { flowId, templatedFrom, data };
};
