// TODO: Should this actually exist or should we use
// a more universal existing type?
export interface Node {
  id: string;
  data: {
    text: string;
    flag?: string;
    info?: string;
    policyRef?: string;
  };
}
