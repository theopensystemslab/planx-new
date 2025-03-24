import { gql } from "graphql-request";
import { $public } from "../../../client/index.js";
import { ServerError } from "../../../errors/serverError.js";
import type { CopyFlowController } from "./controller.js";

const getFlowPermissions = async (
  id: string,
): Promise<{ isCopiable: boolean }> => {
  try {
    const { flow } = await $public.client.request<{
      flow: { isCopiable: boolean } | null;
    }>(
      gql`
        query GetFlowPermissions($id: uuid!) {
          flow: flows_by_pk(id: $id) {
            isCopiable: is_copiable
          }
        }
      `,
      { id },
    );
    if (!flow) throw Error(`Unable to get flow with id ${id}`);

    return flow;
  } catch (error) {
    throw Error(`Failed to get flow permissions. Error: ${error}`);
  }
};

export const canCopyFlow: CopyFlowController = async (req, res, next) => {
  const { flowId } = res.locals.parsedReq.params;
  const { isCopiable } = await getFlowPermissions(flowId);

  if (!isCopiable) {
    return next(
      new ServerError({
        message: "Flow copying is not permitted for this flow",
      }),
    );
  }

  return next();
};
