export type IsServiceVars = { flowId: string};
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
