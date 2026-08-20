import { configure } from "@testing-library/react";

// RTL's 1s default for waitFor/findBy can fail on slow/busy machines rather than genuine bugs
configure({ asyncUtilTimeout: 5_000 });
