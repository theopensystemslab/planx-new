import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as cloudflare from "@pulumi/cloudflare";
import * as pulumi from "@pulumi/pulumi";
import * as tldjs from "tldjs";

import {
  createAllIpv4EgressRule,
  createAllIpv4IngressRule,
  createDestinationSgEgressRule,
  createSourceSgIngressRule,
} from "../../common/utils";
import type { SetupLoadBalancer } from "../types";
import { addRedirectToCloudFlareListenerRule } from "./addListenerRule";

export const setupLoadBalancer = async ({
  serviceName,
  containerPort,
  vpcId,
  publicSubnetIds,
  domain,
  idleTimeout,
  healthCheck,
  stickiness,
}: SetupLoadBalancer): Promise<{
  loadBalancer: awsx.lb.ApplicationLoadBalancer,
  targetGroup: aws.lb.TargetGroup,
  serviceSecurityGroup: aws.ec2.SecurityGroup,
}> => {
  // prepare security groups as per AWS docs, with SG for load balancer and Fargate service serving as source/destination for each other
  // see: https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-update-security-groups.html
  const lbSecurityGroup = new aws.ec2.SecurityGroup(`${serviceName}-lb-sg`, {
    description: `Security group for ${serviceName} load balancer`,
    vpcId: vpcId,
  });
  const serviceSecurityGroup = new aws.ec2.SecurityGroup(`${serviceName}-service-sg`, {
    description: `Security group for ${serviceName} Fargate service`,
    vpcId: vpcId,
  });

  // LB SG accepts traffic from open internet, and allows outbound traffic only to Fargate service SG
  createAllIpv4IngressRule(lbSecurityGroup.id, `${serviceName}-lb`);
  createDestinationSgEgressRule(lbSecurityGroup.id, `${serviceName}-lb`, [containerPort], serviceSecurityGroup.id);
  // SG for the Fargate service accepts inbound traffic only from the LB SG, and allows outbound traffic to open internet
  createSourceSgIngressRule(serviceSecurityGroup.id, `${serviceName}-service`, [containerPort], lbSecurityGroup.id);
  createAllIpv4EgressRule(serviceSecurityGroup.id, `${serviceName}-service`);

  // XXX: does this ALB have a default listener? (we would prefer not)
  const loadBalancer = new awsx.lb.ApplicationLoadBalancer(`${serviceName}-lb`, {
    internal: false,
    subnetIds: publicSubnetIds,
    // NB. VPC to be which the ALB belongs is conveyed by the security group
    securityGroups: [lbSecurityGroup.id],
    idleTimeout: idleTimeout ?? 60,
    // Do not auto-create a listener
    listener: undefined,
  });

  // tag on a listener with service container as target
  const targetGroup = new aws.lb.TargetGroup(`${serviceName}`, {
    port: containerPort,
    protocol: "HTTP",
    vpcId: vpcId,
    // our Fargate services are on the `awsvpc` network mode, so we need ip as the target type
    // see https://docs.aws.amazon.com/AmazonECS/latest/developerguide/alb.html
    targetType: "ip",
    // we only pass health check/stickness objects here if they're passed in above, to avoid overwriting defaults
    ...(typeof healthCheck !== 'undefined' && { healthCheck }),
    ...(typeof stickiness !== 'undefined' && { stickiness }),
  });

  // XXX: we should accept HTTPS connections (i.e. traffic from Cloudflare reverse proxy to AWS is unencrypted !?)
  const listenerHttp = new aws.lb.Listener(`${serviceName}-http`, {
    loadBalancerArn: loadBalancer.loadBalancer.arn,
    port: 80,
    protocol: "HTTP",
    // NB. default action is always evaluated last (i.e. if no other rule/action is triggered)
    defaultActions: [{
      type: "forward",
      targetGroupArn: targetGroup.arn,
    }],
  });

  addRedirectToCloudFlareListenerRule({
    serviceName: serviceName,
    listener: listenerHttp,
    domain,
  });

  return {
    loadBalancer,
    targetGroup,
    serviceSecurityGroup,
  }
}

/**
 * Send a Slack notification when a Fargate service deployment is rolled back by the circuit breaker
 */
export const setupNotificationForDeploymentRollback = (
  env: string,
  serviceName: string,
  cluster: aws.ecs.Cluster,
  service: awsx.ecs.FargateService
): void => {
  const config = new pulumi.Config();
  const topic = new aws.sns.Topic(`${serviceName}-rollback-alerts`, {
    name: `${serviceName}-rollback-alerts-topic`,
  });

  new aws.sns.TopicSubscription(
    `${serviceName}-rollback-alerts-subscription`,
    {
      topic: topic.arn,
      protocol: "https",
      endpoint: config.requireSecret("slack-internal-errors-webhook"),
    }
  );

  // allow SNS topic to receive events from EventBridge
  new aws.sns.TopicPolicy(`${serviceName}-rollback-alerts-topic-policy`, {
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
    `${serviceName}-rollback-detection-rule`,
    {
      description: `Detect deployment rollbacks for ${serviceName}`,
      eventPattern: pulumi.jsonStringify({
        source: ["aws.ecs"],
        "detail-type": ["ECS Deployment State Change"],
        // see https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-pattern-operators.html
        resources: [service.service.arn],
        detail: {
          eventType: ["ERROR"],
          eventName: ["SERVICE_DEPLOYMENT_FAILED"],
          clusterArn: [cluster.arn],
        }
      })
    }
  );

  new aws.cloudwatch.EventTarget(
    `${serviceName}-rollback-alerts-target`,
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
        inputTemplate: pulumi.jsonStringify([
            `-> Environment: ${env}`,
            `-> Affected service: ${serviceName}`,
            "-> Event type: <eventType>",
            "-> Event name: <eventName>",
            "-> Deployment ID: <deploymentId>",
            "-> Updated at: <updatedAt>",
            "-> Reason: <reason>",
          ].join("\n")),
      },
    }
  );
};

export const setupDnsRecord = async (
  serviceName: string,
  domain: string,
  loadBalancer: awsx.lb.ApplicationLoadBalancer
) => {
  const config = new pulumi.Config();
  return new cloudflare.DnsRecord(serviceName, {
    name: tldjs.getSubdomain(domain)
      ? `${serviceName}.${tldjs.getSubdomain(domain)}`
      : serviceName,
    type: "CNAME",
    zoneId: config.require("cloudflare-zone-id"),
    content: loadBalancer.loadBalancer.dnsName,
    ttl: 1,
    proxied: true,
  });
}
