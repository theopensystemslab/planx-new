"use strict";

import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

/**
 * Send a Slack notification when a Fargate service rolls back it's deployment
 * Any initial Pulumi errors already handle this via notifications from GHA
 * This will catch instances where the container has successfully deployed, but may be unhealthy and is caught by a circuit breaker
 */
export const setupFailureNotificationForDeployments = (
  serviceName: string,
  cluster: awsx.ecs.Cluster,
  service: awsx.ecs.FargateService
) => {
  const config = new pulumi.Config();

  const topic = new aws.sns.Topic(`${serviceName}-deployment-alerts`, {
    name: `${serviceName}-deployment-alerts`,
  });

  new aws.sns.TopicSubscription(
    `${serviceName}-slack-alert`,
    {
      topic: topic.arn,
      protocol: "https",
      endpoint: config.requireSecret("slack-internal-errors-webhook"),
    }
  );

  new aws.cloudwatch.MetricAlarm(
    `${serviceName}-deployment-alarm-notification`,
    {
      alarmActions: [topic.arn],
      comparisonOperator: "GreaterThanThreshold",
      evaluationPeriods: 1,
      metricName: "ECSServiceFailedTaskCount",
      namespace: "AWS/ECS",
      period: 300,
      statistic: "Sum",
      threshold: 0,
      alarmDescription: `Alarm for ${serviceName} Fargate service deployment failures`,
      dimensions: {
        ClusterName: cluster.cluster.name,
        ServiceName: service.service.name,
      },
    }
  );
};