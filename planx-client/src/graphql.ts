import axios from "axios";
import log from "./logger";

export function graphQLClient(args: { url: string; secret: string }): Request {
  return async (query, variables): Promise<any> => {
    const response = await axios({
      method: "POST",
      url: args.url,
      headers: {
        "X-Hasura-Admin-Secret": args.secret,
      },
      data: {
        query,
        variables,
      },
    });
    const { data, errors } = response.data;
    if (errors) {
      log(errors);
      const messages = errors.map((e: { message: string }) => e.message);
      throw new Error(messages);
    }
    return data;
  };
}

export type Request = (query: string, variables: object) => Promise<any>;
