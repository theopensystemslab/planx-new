/**
 * Mirrors structure of lowcal_sessions table and relationships
 */
export interface Application {
  id: string;
  addressLine: string | null;
  addressTitle: string | null;
  createdAt: string;
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

export type Draft = Application & {
  expiresAt: string;
};

export type Submitted = Application & {
  submittedAt: string;
};

export interface ConsumeMagicLink {
  updateMagicLinks: {
    returning: {
      drafts: Draft[];
      submitted: Submitted[];
    }[];
  };
}
