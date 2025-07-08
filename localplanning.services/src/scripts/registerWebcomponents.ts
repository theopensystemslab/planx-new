import { PostcodeSearch } from "@opensystemslab/map";

if (!customElements.get("postcode-search")) {
  customElements.define("postcode-search", PostcodeSearch);
}
