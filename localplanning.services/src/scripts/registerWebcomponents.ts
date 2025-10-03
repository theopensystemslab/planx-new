import { GeocodeAutocomplete, MyMap } from "@opensystemslab/map";

if (!customElements.get("geocode-autocomplete")) {
  customElements.define("geocode-autocomplete", GeocodeAutocomplete)
}

if (!customElements.get("my-map")) {
  customElements.define("my-map", MyMap);
}
