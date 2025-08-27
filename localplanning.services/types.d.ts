declare module "@opensystemslab/map";

declare namespace JSX {
  interface IntrinsicElements {
    "postcode-search": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
    "geocode-autocomplete": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
  }
}
