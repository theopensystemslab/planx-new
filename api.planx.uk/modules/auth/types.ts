import type { Role } from "@opensystemslab/planx-core/types";

export type HasuraNamespace = "https://hasura.io/jwt/claims";
export type HasuraClaims = {
  "x-hasura-allowed-roles": Role[];
  "x-hasura-default-role": Role;
  "x-hasura-user-id": number;
};
export type HasuraJWT = Record<HasuraNamespace, HasuraClaims>;

export type JWTData = HasuraJWT & {
  sub: string;
  email: string;
};
