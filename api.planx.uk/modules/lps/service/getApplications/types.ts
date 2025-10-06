/**
 * Mirrors structure of lowcal_sessions table and relationships
 */
export interface BaseApplication {
  id: string;
  addressLine: string | null;
  addressTitle: string | null;
  createdAt: string;
  updatedAt: string;
  service: {
    name: string;
    slug: string;
    team: {
      name: string;
      slug: string;
      domain: string | null;
    };
  };
}

export type Draft = BaseApplication & {
  status: "draft";
};

export type AwaitingPayment = BaseApplication & {
  status: "awaitingPayment";
  submittedAt: string;
  paymentRequest: {
    createdAt: string;
  }[];
};

export type Submitted = BaseApplication & {
  status: "submitted";
  submittedAt: string;
};

export type Application = Draft | AwaitingPayment | Submitted;

export interface ConsumeMagicLink {
  updateMagicLinks: {
    returning: {
      applications: Application[];
    }[];
  };
}
