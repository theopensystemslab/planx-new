import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

import { CreateService } from './../types';
import {
  generateCORSAllowList,
  generateTeamSecrets,
  setupDnsRecord,
  setupLoadBalancer,
  setupNotificationForDeploymentRollback,
} from "../utils";

export const createApiService = async ({
  env,
  vpcId,
  publicSubnetIds,
  cluster,
  repo,
  customDomains = [],
  stacks: { certificates, data } = {}
}: CreateService): Promise<awsx.ecs.FargateService> => {
  if (!repo) {
    throw new Error("An ECR repo is required to setup API service");
  }
  if (!certificates) {
    throw new Error("The Pulumi certificates stack is required to setup API service");
  }
  if (!data) {
    throw new Error("The Pulumi data stack is required to setup API service");
  }
  const config = new pulumi.Config();
  const DOMAIN: string = await certificates.requireOutputValue("domain");

  const apiBucket = aws.s3.Bucket.get(
    "bucket",
    data.requireOutput("apiBucketId")
  );
  const apiUser = new aws.iam.User("api-user");
  const apiUserAccessKey = new aws.iam.AccessKey("api-user-access-key", {
    user: apiUser.name,
  });
  // Grant the user access to the bucket
  new aws.iam.UserPolicy("api-user-role", {
    user: apiUser.name,
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Action: "s3:*",
          Resource: apiBucket.arn,
        },
      ],
    },
  });
  new aws.s3.BucketPolicy("api-bucket-policy", {
    bucket: apiBucket.id,
    policy: {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "ApiWriteObject",
          Effect: "Allow",
          Principal: { AWS: [apiUser.arn] },
          // XXX: We could narrow this down to the action `PutObject`
          Action: ["s3:*"],
          Resource: [pulumi.interpolate`${apiBucket.arn}/*`],
        },
      ],
    },
  });

  const API_PORT = 80;
  const {
    loadBalancer: apiLb,
    targetGroup: apiTargetGroup,
    serviceSecurityGroup: apiServiceSecurityGroup,
  } = await setupLoadBalancer({
    serviceName: "api",
    containerPort: API_PORT,
    vpcId,
    publicSubnetIds,
    domain: DOMAIN,
    idleTimeout: 120,
    healthCheck: { path: "/" },
  });

  const apiImage = new awsx.ecr.Image("api-image", {
    repositoryUrl: repo.url,
    context: "../../apps/api.planx.uk",
    args: {
      target: "production",
    },
  });
  const apiLogGroup = new aws.cloudwatch.LogGroup("api", {
    name: "/ecs/api",
    retentionInDays: 30,
  });
  const apiTask = new awsx.ecs.FargateTaskDefinition("api", {
    logGroup: { existing: apiLogGroup },
    container: {
      name: "api",
      image: apiImage.imageUri,
      essential: true,
      cpu: 2048,
      memory: 4096 /*MB*/,
      portMappings: [{ targetGroup: apiTargetGroup }],
      environment: [
          { name: "NODE_ENV", value: env },
          { name: "APP_ENVIRONMENT", value: env },
          { name: "EDITOR_URL_EXT", value: `https://${DOMAIN}` },
          { name: "AWS_S3_REGION", value: apiBucket.region },
          { name: "AWS_ACCESS_KEY", value: apiUserAccessKey.id },
          { name: "AWS_SECRET_KEY", value: apiUserAccessKey.secret },
          {
            name: "AWS_S3_BUCKET",
            value: pulumi.interpolate`${apiBucket.bucket}`,
          },
          {
            name: "AI_GATEWAY_API_KEY",
            value: config.requireSecret("ai-gateway-api-key"),
          },
          {
            name: "FILE_API_KEY",
            value: config.requireSecret("file-api-key"),
          },
          {
            name: "FILE_API_KEY_NEXUS",
            value: config.requireSecret("file-api-key-nexus"),
          },
          {
            name: "FILE_API_KEY_BARNET",
            value: config.requireSecret("file-api-key-barnet"),
          },
          {
            name: "FILE_API_KEY_LAMBETH",
            value: config.requireSecret("file-api-key-lambeth"),
          },
          {
            name: "FILE_API_KEY_SOUTHWARK",
            value: config.requireSecret("file-api-key-southwark"),
          },
          {
            name: "FILE_API_KEY_EPSOM_EWELL",
            value: config.requireSecret("file-api-key-epsom-ewell"),
          },
          {
            name: "FILE_API_KEY_MEDWAY",
            value: config.requireSecret("file-api-key-medway"),
          },
          {
            name: "FILE_API_KEY_GATESHEAD",
            value: config.requireSecret("file-api-key-gateshead"),
          },
          {
            name: "FILE_API_KEY_DONCASTER",
            value: config.requireSecret("file-api-key-doncaster"),
          },
          {
            name: "FILE_API_KEY_GLOUCESTER",
            value: config.requireSecret("file-api-key-gloucester"),
          },
          {
            name: "FILE_API_KEY_TEWKESBURY",
            value: config.requireSecret("file-api-key-tewkesbury"),
          },
          {
            name: "FILE_API_KEY_CAMDEN",
            value: config.requireSecret("file-api-key-camden"),
          },
          {
            name: "SKIP_RATE_LIMIT_SECRET",
            value: config.requireSecret("skip-rate-limit-secret"),
          },
          {
            name: "GOOGLE_CLIENT_ID",
            value: config.requireSecret("google-client-id"),
          },
          {
            name: "GOOGLE_CLIENT_SECRET",
            value: config.requireSecret("google-client-secret"),
          },
          {
            name: "MICROSOFT_CLIENT_ID",
            value: config.requireSecret("microsoft-client-id"),
          },
          {
            name: "MICROSOFT_CLIENT_SECRET",
            value: config.requireSecret("microsoft-client-secret"),
          },
          {
            name: "SESSION_SECRET",
            value: config.requireSecret("session-secret"),
          },
          { name: "API_URL_EXT", value: `https://api.${DOMAIN}` },
          { name: "JWT_SECRET", value: config.requireSecret("jwt-secret") },
          { name: "PORT", value: String(API_PORT) },
          {
            name: "HASURA_GRAPHQL_ADMIN_SECRET",
            value: config.requireSecret("hasura-admin-secret"),
          },
          {
            name: "HASURA_GRAPHQL_URL",
            value: pulumi.interpolate`https://hasura.${DOMAIN}/v1/graphql`,
          },
          {
            name: "HASURA_METADATA_URL",
            value: pulumi.interpolate`https://hasura.${DOMAIN}/v1/metadata`,
          },
          {
            name: "HASURA_SCHEMA_URL",
            value: pulumi.interpolate`https://hasura.${DOMAIN}/v2/query`,
          },
          {
            name: "HASURA_PLANX_API_KEY",
            value: config.requireSecret("hasura-planx-api-key"),
          },
          {
            name: "AIRBRAKE_PROJECT_ID",
            value: config.requireSecret("airbrake-project-id"),
          },
          {
            name: "AIRBRAKE_PROJECT_KEY",
            value: config.requireSecret("airbrake-project-key"),
          },
          {
            name: "UNIFORM_TOKEN_URL",
            value: config.requireSecret("uniform-token-url"),
          },
          {
            name: "UNIFORM_SUBMISSION_URL",
            value: config.requireSecret("uniform-submission-url"),
          },
          {
            name: "GOVUK_NOTIFY_API_KEY",
            value: config.requireSecret("govuk-notify-api-key"),
          },
          {
            name: "SLACK_WEBHOOK_URL",
            value: config.requireSecret("slack-webhook-url"),
          },
          {
            name: "ORDNANCE_SURVEY_API_KEY",
            value: config.requireSecret("ordnance-survey-api-key"),
          },
          {
            name: "ENCRYPTION_KEY",
            value: config.requireSecret("encryption-key"),
          },
          {
            name: "IDOX_NEXUS_CLIENT",
            value: config.requireSecret("idox-nexus-client"),
          },
          {
            name: "IDOX_NEXUS_TOKEN_URL",
            value: config.requireSecret("idox-nexus-token-url"),
          },
          {
            name: "IDOX_NEXUS_SUBMISSION_URL",
            value: config.requireSecret("idox-nexus-submission-url"),
          },
          {
            name: "MAPBOX_ACCESS_TOKEN",
            value: config.requireSecret("mapbox-access-token"),
          },
          {
            name: "METABASE_API_KEY",
            value: config.requireSecret("metabase-api-key"),
          },
          {
            name: "METABASE_URL_EXT",
            value: `https://metabase.${DOMAIN}`,
          },
          {
            name: "LPS_URL_EXT",
            value: pulumi.interpolate`https://${config.require("lps-domain")}`,
          },
          generateCORSAllowList(customDomains, DOMAIN),
          ...generateTeamSecrets(config, env),
        ],
      },
    });

  const apiService = new awsx.ecs.FargateService("api", {
    cluster: cluster.arn,
    taskDefinition: apiTask.taskDefinition.arn,
    loadBalancers: apiTask.loadBalancers,
    networkConfiguration: {
      subnets: publicSubnetIds,
      // assignPublicIp: true,
      securityGroups: [apiServiceSecurityGroup.id],
    },
    desiredCount: 1,
    deploymentCircuitBreaker: {
      enable: true,
      rollback: true,
    },
  },
  {
    dependsOn: [apiLb],
  });

  setupNotificationForDeploymentRollback(env, "api", cluster, apiService);
  setupDnsRecord("api", DOMAIN, apiLb);
  return apiService;
}
