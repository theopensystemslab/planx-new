import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as fs from "fs";

import { usEast1 } from "./providers";

/**
 * Creates a Lambda@Edge function that rewrites LPS pretty URLs to the real
 * *.html S3 keys at the edge (e.g. `/about` -> `/about.html`), so the static
 * site can be deployed to S3 without rewriting keys on upload.
 */
export const createLpsUrlRewriteLambda = () => {
  const config = new pulumi.Config();
  const lambdaNodejsRuntime = config.require("lambda-nodejs-runtime");

  const assumeRolePolicy = aws.iam.getPolicyDocumentOutput({
    statements: [{
      effect: "Allow",
      principals: [{
        type: "Service",
        identifiers: ["lambda.amazonaws.com", "edgelambda.amazonaws.com"],
      }],
      actions: ["sts:AssumeRole"],
    }],
  }, { provider: usEast1 });

  const role = new aws.iam.Role("lps-url-rewrite-role", {
    assumeRolePolicy: assumeRolePolicy.json,
  });

  new aws.iam.RolePolicyAttachment("lps-url-rewrite-logs", {
    role: role.name,
    policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
  });

  const source = fs.readFileSync(
    `${process.cwd()}/aws/lambda/lps_url_rewrite.js`,
    "utf-8",
  );

  const lambda = new aws.lambda.Function(
    "lps-url-rewrite",
    {
      runtime: lambdaNodejsRuntime,
      handler: "lps_url_rewrite.handler",
      role: role.arn,
      code: new pulumi.asset.AssetArchive({
        "lps_url_rewrite.js": new pulumi.asset.StringAsset(source),
      }),
      publish: true,
    },
    { provider: usEast1 },
  );

  return lambda;
};
