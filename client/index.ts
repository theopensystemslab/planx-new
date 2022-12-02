import slugify from "lodash.kababcase";
import { graphQLClient } from "./graphql";
import { user } from "./user";
import { team } from "./team";

const defaultURL = `http://localhost:${HASURA_PROXY_PORT}/v1/graphql`;

export default class Client {
  constructor(args: { hasuraSecret: string; targetURL: string | undefined }) {
    this.url = args.targetURL || defaultURL;
    this.request = graphQLClient(args.hasuraSecret);
  }

  async createUser(args: {
    firstName: string;
    lastName: string;
    userEmail: string;
  }) {
    return user.createUser(this.request, args);
  }

  async createTeam(args: {
    name: string;
    slug: string | undefined;
    logo: string;
    primaryColor: string;
    homepage: string;
  }) {
    const slug = slugify(args.name);
    return team.createTeam(this.request, { ...args, slug });
  }

  async createFlow(args: { name: string }) {
    return team.createTeam(this.request, args);
  }
}
