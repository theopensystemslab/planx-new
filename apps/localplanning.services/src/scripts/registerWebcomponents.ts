import { GeocodeAutocomplete } from "@opensystemslab/map";

if (!customElements.get("geocode-autocomplete")) {
  customElements.define("geocode-autocomplete", GeocodeAutocomplete)
}
