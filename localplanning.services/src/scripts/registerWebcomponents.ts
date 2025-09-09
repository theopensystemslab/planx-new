import { PostcodeSearch, GeocodeAutocomplete } from "@opensystemslab/map";

if (!customElements.get("postcode-search")) {
  customElements.define("postcode-search", PostcodeSearch);
}

if (!customElements.get("geocode-autocomplete")) {
  customElements.define("geocode-autocomplete", GeocodeAutocomplete)
}
