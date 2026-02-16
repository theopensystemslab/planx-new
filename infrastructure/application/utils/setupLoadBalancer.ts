import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

import {
  createAllIpv4EgressRule,
  createAllIpv4IngressRule,
  createDestinationSgEgressRule,
  createSourceSgIngressRule,
} from "../../common/utils";
import type { SetupLoadBalancer } from "../types";
import { addRedirectToCloudFlareListenerRule } from "./addListenerRule";

export const setupLoadBalancerForService = async ({
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

  const loadBalancer = new awsx.lb.ApplicationLoadBalancer(`${serviceName}-lb`, {
    internal: false,
    subnetIds: publicSubnetIds,
    // NB. VPC to be which the ALB belongs is conveyed by the security group
    securityGroups: [lbSecurityGroup.id],
    idleTimeout: idleTimeout ?? 60,
  });
  
  // tag on a listener with service container as target
  const targetGroup = new aws.lb.TargetGroup(`${serviceName}`, {
    port: containerPort,
    protocol: "HTTP",
    vpcId: vpcId,
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
