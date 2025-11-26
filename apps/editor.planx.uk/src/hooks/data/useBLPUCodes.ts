import { gql, useQuery } from "@apollo/client";
import { publicClient } from "lib/graphql";

const FETCH_BLPU_CODES = gql`
  query FetchBLPUCodes {
    blpuCodes: blpu_codes {
      code
      description
      value
    }
  }
`;

export interface BLPUCode {
  code: string;
  description: string;
  value: string;
}

export const useBLPUCodes = () =>
  useQuery<{ blpuCodes: BLPUCode[] }>(FETCH_BLPU_CODES, {
    client: publicClient,
  });
