import { Request } from "./graphql";

export async function createUser(
  request: Request,
  args: { firstName: string; lastName: string; userEmail: string }
) {
  const { data, errors } = await request(
    `mutation CreateUser ($first_name: String!, $last_name: String!, $email: String!) {
        insert_users_one(object: {
          first_name: $first_name, 
          last_name: $last_name, 
          email: $email
        }) {
          email
        }
      }`,
    {
      first_name: args.firstName,
      last_name: args.lastName,
      email: args.userEmail,
    }
  );
  if (errors) throw new Error("ERROR: createUser", errors);
  return { ...data.insert_users_one };
}
