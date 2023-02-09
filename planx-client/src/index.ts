import slugify from "lodash.kebabcase";
import { graphQLClient } from "./graphql";
import type { GraphQLClient } from "graphql-request";
import { createUser } from "./user";
import { createTeam } from "./team";
import { createFlow, publishFlow } from "./flow";
import { getDocumentTemplateNames } from "./document-templates";

const defaultURL = process.env.HASURA_GRAPHQL_URL;

export class Client {
  client: GraphQLClient;

  constructor(args: {
    hasuraSecret?: string | undefined;
    targetURL?: string | undefined;
  }) {
    const url: string = args.targetURL ? args.targetURL : defaultURL!;
    this.client = graphQLClient({ url, secret: args.hasuraSecret });
  }

  async createUser(args: {
    firstName: string;
    lastName: string;
    email: string;
  }): Promise<number> {
    return createUser(this.client, args);
  }

  async createTeam(args: {
    name: string;
    slug: string | undefined;
    logo: string;
    primaryColor: string;
    homepage: string;
  }): Promise<number> {
    const slug = args.slug ? args.slug : slugify(args.name);
    return createTeam(this.client, { ...args, slug });
  }

  async createFlow(args: {
    teamId: number;
    slug: string;
    data?: object;
  }): Promise<string> {
    return createFlow(this.client, args);
  }

  async publishFlow(args: {
    flow: { id: string; data: object };
    publisherId: number;
  }): Promise<number> {
    return publishFlow(this.client, args);
  }

  async getDocumentTemplateNames(flowId: string): Promise<string[]> {
    return getDocumentTemplateNames(this.client, flowId);
  }
}
