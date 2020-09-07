import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

// This is to optionally manage the CloudWatch Log Group for the Lambda Function.
// If skipping this resource configuration, also add "logs:CreateLogGroup" to the IAM policy below.
const example = new aws.cloudwatch.LogGroup("example", { retentionInDays: 14 });
// See also the following AWS managed policy: AWSLambdaBasicExecutionRole
const lambdaLogging = new aws.iam.Policy("lambdaLogging", {
  path: "/",
  description: "IAM policy for logging from a lambda",
  policy: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*",
      "Effect": "Allow"
    }
  ]
}
`
});
const lambdaRole = new aws.iam.Role("lambdaRole", {
  assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
    Service: "lambda.amazonaws.com"
  })
});
const lambdaLogs = new aws.iam.RolePolicyAttachment("lambdaLogs", {
  role: lambdaRole.name,
  policyArn: lambdaLogging.arn
});

const lambda = new aws.lambda.CallbackFunction(
  "foo",
  {
    role: lambdaRole,
    callback: (event: any, context, callback) => {
      event.response = {
        claimsOverrideDetails: {
          claimsToAddOrOverride: {
            "https://hasura.io/jwt/claims": JSON.stringify({
              "x-hasura-user-id": event.request.userAttributes.sub,
              "x-hasura-default-role": "user",
              // do some custom logic to decide allowed roles
              "x-hasura-allowed-roles": ["user"]
            })
          }
        }
      };
      callback(null, event);
    }
  },

  { dependsOn: [lambdaLogs, example] }
);
const pool = new aws.cognito.UserPool("pool", {
  usernameAttributes: ["email", "phone_number"],
  usernameConfiguration: {
    caseSensitive: true
  },
  lambdaConfig: {
    preTokenGeneration: lambda.arn
  }
});

const DOMAIN = "osl-test-1";
const domain = new aws.cognito.UserPoolDomain("main", {
  domain: DOMAIN,
  userPoolId: pool.id
});

const allowedOauthScopes = ["email", "phone", "openid", "profile"];
const callbackUrl = "http://localhost:3000/cognito-callback";
const client = new aws.cognito.UserPoolClient("client", {
  userPoolId: pool.id,
  allowedOauthFlows: ["implicit"],
  callbackUrls: [callbackUrl],
  logoutUrls: ["http://localhost:3000/logout"],
  allowedOauthScopes,
  allowedOauthFlowsUserPoolClient: true,
  generateSecret: false,
  // The following are supported: COGNITO, Facebook, Google and LoginWithAmazon.
  supportedIdentityProviders: ["COGNITO"]
});

// export const authURL = `https://${DOMAIN}.auth.${new pulumi.Config(
//   "aws"
// ).require("region")}.amazoncognito.com/login?client_id=${}&scope=${allowedOauthScopes.join("+")}&redirect_uri=${callbackUrl}`;
