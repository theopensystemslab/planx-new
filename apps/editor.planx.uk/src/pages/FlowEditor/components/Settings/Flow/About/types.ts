export interface AboutFlow {
  summary: string;
  description: string;
  limitations: string;
}

export interface GetAboutFlow {
  flow: AboutFlow;
}

export interface UpdateAboutFlow {
  flow: Partial<AboutFlow>;
}
