import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

// load env
const config = dotenv.config({ path: "../../../.env" });
dotenvExpand.expand(config);
