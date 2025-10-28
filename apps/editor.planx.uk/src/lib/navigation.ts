import { createBrowserNavigation } from "navi";

import routes from "../routes-navi";

const navigation = createBrowserNavigation({
  routes,
});

export default navigation;
