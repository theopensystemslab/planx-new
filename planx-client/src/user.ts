import { Request } from "./graphql";

export async function createUser(
  request: Request,
  args: { firstName: string; lastName: string; email: string }
) {
  const { insert_users_one: response } = await request(
    `mutation CreateUser ($first_name: String!, $last_name: String!, $email: String!) {
        insert_users_one(object: {
          first_name: $first_name, 
          last_name: $last_name, 
          email: $email
        }) {
          id
        }
      }`,
    {
      first_name: args.firstName,
      last_name: args.lastName,
      email: args.email,
    }
  );
  return response;
}
