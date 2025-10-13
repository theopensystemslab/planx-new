export interface ExternalPortalsProps {
  externalPortals: Record<
    string,
    {
      name: string;
      href: string;
    }
  >;
}
