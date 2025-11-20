"use strict";

import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

/**
 * Send a Slack notification when a Fargate service deployment is rolled back by the circuit breaker
 */
export const setupNotificationForDeploymentRollback = (
  simpleServiceName: string,
  cluster: awsx.ecs.Cluster,
  service: awsx.ecs.FargateService
) => {
  const config = new pulumi.Config();

  const topic = new aws.sns.Topic(`${simpleServiceName}-rollback-alerts`, {
    name: `${simpleServiceName}-rollback-alerts-topic`,
  });

  new aws.sns.TopicSubscription(
    `${simpleServiceName}-rollback-alerts-subscription`,
    {
      topic: topic.arn,
      protocol: "https",
      endpoint: config.requireSecret("slack-internal-errors-webhook"),
    }
  );

  // allow SNS topic to receive events from EventBridge
  new aws.sns.TopicPolicy(`${simpleServiceName}-rollback-alerts-topic-policy`, {
    arn: topic.arn,
    policy: pulumi.jsonStringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: {
            Service: "events.amazonaws.com"
          },
          Action: "sns:Publish",
          Resource: topic.arn
        }
      ]
    })
  });

  // EventBridge rule to catch circuit breaker rollbacks
  // https://docs.aws.amazon.com/AmazonECS/latest/developerguide/ecs_service_deployment_events.html
  const rollbackRule = new aws.cloudwatch.EventRule(
    `${simpleServiceName}-rollback-detection-rule`,
    {
      description: `Detect deployment rollbacks for ${simpleServiceName}`,
      eventPattern: pulumi.jsonStringify({
        source: ["aws.ecs"],
        "detail-type": ["ECS Deployment State Change"],
        detail: {
          clusterArn: [cluster.cluster.arn],
          serviceName: [service.service.name],
          eventType: ["ERROR"],
          eventName: ["SERVICE_DEPLOYMENT_FAILED"],
        }
      })
    }
  );

  // XXX: this template may not be ingested by SNS/Slack as expected and can then be simplified
  new aws.cloudwatch.EventTarget(
    `${simpleServiceName}-rollback-alerts-target`,
    {
      rule: rollbackRule.name,
      arn: topic.arn,
      inputTransformer: {
        inputPaths: {
          eventType: "$.detail.eventType",
          eventName: "$.detail.eventName",
          deploymentId: "$.detail.deploymentId",
          updatedAt: "$.detail.updatedAt",
          reason: "$.detail.reason",
        },
        inputTemplate: pulumi.jsonStringify({
          "text": `Circuit Breaker Rollback: ${simpleServiceName}`,
          "blocks": [
            {
              "type": "header",
              "text": {
                "type": "plain_text",
                "text": `Circuit Breaker Rollback: ${simpleServiceName}`
              }
            },
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": "The ECS deployment circuit breaker has triggered a rollback due to deployment failure."
              }
            },
            {
              "type": "section",
              "fields": [
                {
                  "type": "mrkdwn",
                  "text": "*Event type:* <eventType>"
                },
                {
                  "type": "mrkdwn",
                  "text": "*Event name:* <eventName>"
                },
                {
                  "type": "mrkdwn",
                  "text": "*Deployment ID:* <deploymentId>"
                },
                {
                  "type": "mrkdwn",
                  "text": "*Updated at:* <updatedAt>"
                },
                {
                  "type": "mrkdwn",
                  "text": "*Reason:* <reason>"
                }
              ]
            }
          ]
        })
      }
    }
  );
};
