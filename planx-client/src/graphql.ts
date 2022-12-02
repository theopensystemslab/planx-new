import axios from "axios";

export async function graphQLClient(args: {
  url: string;
  secret: string;
}): Request {
  return async (query, variables) => {
    return await axios({
      method: "POST",
      url: args.url,
      headers: {
        "X-Hasura-Admin-Secret": args.secret,
      },
      responseType: "json",
      data: {
        query,
        variables,
      },
    });
  };
}

export type Request = (string, string) => string;
