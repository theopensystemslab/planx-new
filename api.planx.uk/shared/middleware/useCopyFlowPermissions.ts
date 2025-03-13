/**
 * Only allow flow to be copied if is_copiable is true in the flow table for this flowId
 */
export const useCopyFlowPermissions = () => async (_req, res, next) => {
    try {
        const {flowId} = _req.params
    }
//   const currentEnv = process.env.NODE_ENV as Environment;
//   const isBlocked = !envs.includes(currentEnv);
//   if (isBlocked) return res.status(403).send();

  return next();
};
