import { gql, useQuery } from "@apollo/client";

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
    context: { role: "public" },
  });
