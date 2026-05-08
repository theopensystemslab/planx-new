export type GetIsServiceVars = { flowId: string};
export type GetIsServiceResponse = 
    {
      flow: {
        isService: boolean,
        team: {
          settings: {
            isTrial: boolean;
          }
        }
      }
    }
export type IsServiceFormValues = { isService: boolean };
export type UpdateIsServiceVars = { flowId: string, isService: boolean };
