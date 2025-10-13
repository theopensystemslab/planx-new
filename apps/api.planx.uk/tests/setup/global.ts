import dotenv from "dotenv";

export default function setup() {
  dotenv.config({
    // path is relative to apps/api.planx.uk root
    path: ".env.test",
    override: true,
  });
}
