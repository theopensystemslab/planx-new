import { createBrowserNavigation } from "navi";

import routes from "../routes";

const navigation = createBrowserNavigation({
  routes,
});

export default navigation;
