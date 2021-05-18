const fs = require("fs");

const mightBeEnv = /[A-Z][A-Z0-9_]{3,}/g;

const possibleDockerEnvVars = new Set(
  fs
    .readdirSync("..")
    .filter((fn) => fn.startsWith("docker-"))
    .flatMap((file) => {
      const data = fs.readFileSync(`../${file}`);
      return data.toString().match(mightBeEnv);
    })
);

const possiblePulumiEnvVars = new Set(
  fs.readFileSync(`./application/index.ts`).toString().match(mightBeEnv)
);

const inDockerAndPulumi = new Set(
  [...possibleDockerEnvVars].filter((x) => possiblePulumiEnvVars.has(x))
);

const inDockerOnly = new Set(
  [...possibleDockerEnvVars].filter((x) => !possiblePulumiEnvVars.has(x))
);

const inPulumiOnly = new Set(
  [...possiblePulumiEnvVars].filter((x) => !possibleDockerEnvVars.has(x))
);

console.log({ inDockerAndPulumi, inDockerOnly, inPulumiOnly });
