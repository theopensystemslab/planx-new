import { GraphQLClient } from "graphql-request";
import { express as voyagerMiddleware } from "graphql-voyager/middleware";
import { NextFunction, Response, Request } from "express";

export function graphQLVoyagerHandler(args: {
  graphQLURL: string;
  validateUser: boolean;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (args.validateUser && !req.user?.sub)
      return next({ status: 401, message: "User ID missing from JWT" });
    res.header(
      "Content-Security-Policy",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net"
    );
    res.header("Content-Security-Policy", "worker-src blob:");
    return voyagerMiddleware({
      endpointUrl: args.graphQLURL,
    })(req, res);
  };
}

export function introspectionHandler(args: {
  graphQLClient: GraphQLClient;
  validateUser: boolean;
}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (args.validateUser && !req.user?.sub)
      return next({ status: 401, message: "User ID missing from JWT" });
    const introspection = await args.graphQLClient.request(
      getIntrospectionQuery()
    );
    return res.json({ data: introspection });
  };
}

function getIntrospectionQuery(): string {
  return `query IntrospectionQuery {
      __schema {
        queryType { name }
        mutationType { name }
        subscriptionType { name }
        types {
          ...FullType
        }
        directives {
          name
          description
          locations
          args {
            ...InputValue
          }
        }
      }
    }

    fragment FullType on __Type {
      kind
      name
      description
      fields(includeDeprecated: true) {
        name
        description
        args {
          ...InputValue
        }
        type {
          ...TypeRef
        }
        isDeprecated
        deprecationReason
      }
      inputFields {
        ...InputValue
      }
      interfaces {
        ...TypeRef
      }
      enumValues(includeDeprecated: true) {
        name
        description
        isDeprecated
        deprecationReason
      }
      possibleTypes {
        ...TypeRef
      }
    }

    fragment InputValue on __InputValue {
      name
      description
      type { ...TypeRef }
      defaultValue
    }

    fragment TypeRef on __Type {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                  }
                }
              }
            }
          }
        }
      }
    }`;
}
