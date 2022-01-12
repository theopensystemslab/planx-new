// eslint-disable-next-line no-restricted-imports
import { configureAxe } from "jest-axe";

const axe = configureAxe({
  rules: {
    // Currently, jest-axe does not correctly evaluate this rule due to an issue with jsdom
    // https://github.com/dequelabs/axe-core/issues/2587
    // To pass this test, non-decorative MUI icons should always use the 'titleAccess' prop
    "svg-img-alt": { enabled: false },
  },
});

export default axe;
