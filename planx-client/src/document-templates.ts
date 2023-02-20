import { gql } from "graphql-request";
import type { GraphQLClient } from "graphql-request";

export async function getDocumentTemplateNames(
  client: GraphQLClient,
  flowId: string
): Promise<string[]> {
  const { flow_document_templates: response } = await client.request(
    gql`
      query GetDocumentTemplateNames($flowId: uuid!) {
        flow_document_templates(where: { flow: { _eq: $flowId } }) {
          document_template
        }
      }
    `,
    { flowId }
  );
  return response.map(
    (data: { document_template: string }) => data.document_template
  );
}
