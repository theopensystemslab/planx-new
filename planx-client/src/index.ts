import slugify from "lodash.kebabcase";
import { graphQLClient, Request } from "./graphql";
import { createUser } from "./user";
import { createTeam } from "./team";
import { createFlow, publishFlow } from "./flow";

const defaultURL = process.env.HASURA_GRAPHQL_URL;

export default class Client {
  request: Request;

  constructor(args: { hasuraSecret: string; targetURL: string | undefined }) {
    const url: string = args.targetURL ? args.targetURL : defaultURL!;
    this.request = graphQLClient({ url, secret: args.hasuraSecret });
  }

  async createUser(args: {
    firstName: string;
    lastName: string;
    email: string;
  }): Promise<number> {
    return createUser(this.request, args);
  }

  async createTeam(args: {
    name: string;
    slug: string | undefined;
    logo: string;
    primaryColor: string;
    homepage: string;
  }): Promise<number> {
    const slug = args.slug ? args.slug : slugify(args.name);
    return createTeam(this.request, { ...args, slug });
  }

  async createFlow(args: { teamId: number; slug: string }): Promise<string> {
    return createFlow(this.request, args);
  }

  async publishFlow(args: {
    flow: { id: string; data: object };
    publisherId: number;
  }): Promise<number> {
    return publishFlow(this.request, args);
  }
}
