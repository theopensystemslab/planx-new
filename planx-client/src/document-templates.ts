import { Request } from "./graphql";

export async function getDocumentTemplateNames(
  request: Request,
  flowId: string
): Promise<string[]> {
  const { flow_document_templates: response } = await request(
    `
      query GetDocumentTemplateNames($flowId: uuid!) {
        flow_document_templates(where: {flow: {_eq: $flowId}}) {
          document_template
        }
      }
    `,
    { flowId }
  );
  return response || [];
}
