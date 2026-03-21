import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as fs from "fs";

import { usEast1 } from "./providers";

/**
 * Creates a Lambda@Edge function that intercepts link preview requests
 * and returns skeleton HTML with meta tags for published flow URLs.
 */
export const createFlowLinkPreviewLambda = (hasuraUrl: string) => {

  // Role + policy required for Lambda@Edge functions
  // https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-permissions.html
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

  const role = new aws.iam.Role("flow-link-preview-role", {
    assumeRolePolicy: assumeRolePolicy.json,
  });

  // Attach basic execution role for logging to CloudWatch
  new aws.iam.RolePolicyAttachment("flow-link-preview-logs", {
    role: role.name,
    policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
  });

  // Read function file & swap placeholder with actual Hasura URL
  const source = fs
  .readFileSync(`${process.cwd()}/aws/lambda/flow_link_preview.js`, "utf-8")
    .replace("__HASURA_URL__", hasuraUrl);

  // Create Lambda function in us-east-1 for Lambda@Edge
  const lambda = new aws.lambda.Function(
    "flow-link-preview",
    {
      runtime: "nodejs22.x",
      handler: "flow_link_preview.handler",
      role: role.arn,
      code: new pulumi.asset.AssetArchive({
        "flow_link_preview.js": new pulumi.asset.StringAsset(source),
      }),
      publish: true,
    },
    { provider: usEast1 },
  );

  return lambda;
};
