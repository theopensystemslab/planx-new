import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

export interface SetupAutoScaling {
  serviceName: string,
  cluster: aws.ecs.Cluster,
  service: awsx.ecs.FargateService,
  minCapacity: number,
  maxCapacity: number,
  // target CPU/memory utilisation (%) to scale around - defaults chosen to scale out well ahead of saturation
  targetValue?: number,
}

/**
 * Wire up ECS Application Auto Scaling (CPU + memory target tracking) for a Fargate service.
 * Scales out quickly for responsiveness, but scales in more slowly to avoid thrashing.
 */
export const setupAutoScaling = ({
  serviceName,
  cluster,
  service,
  minCapacity,
  maxCapacity,
  targetValue = 30,
}: SetupAutoScaling): {
  scalingTarget: aws.appautoscaling.Target,
  cpuScaling: aws.appautoscaling.Policy,
  memoryScaling: aws.appautoscaling.Policy,
} => {
  const scalingTarget = new aws.appautoscaling.Target(`${serviceName}-scaling-target`, {
    // maxCapacity should consider compute power of any shared resources (e.g. the RDS instance) this service relies on
    maxCapacity,
    // minCapacity should reflect the baseline load expected
    minCapacity,
    resourceId: pulumi.interpolate`service/${cluster.name}/${service.service.name}`,
    scalableDimension: "ecs:service:DesiredCount",
    serviceNamespace: "ecs",
  });

  const cpuScaling = new aws.appautoscaling.Policy(`${serviceName}-cpu-scaling`, {
    policyType: "TargetTrackingScaling",
    resourceId: scalingTarget.resourceId,
    scalableDimension: scalingTarget.scalableDimension,
    serviceNamespace: scalingTarget.serviceNamespace,
    targetTrackingScalingPolicyConfiguration: {
      predefinedMetricSpecification: {
        predefinedMetricType: "ECSServiceAverageCPUUtilization",
      },
      targetValue,
      scaleInCooldown: 300,
      scaleOutCooldown: 60,
    },
  });

  const memoryScaling = new aws.appautoscaling.Policy(`${serviceName}-memory-scaling`, {
    policyType: "TargetTrackingScaling",
    resourceId: scalingTarget.resourceId,
    scalableDimension: scalingTarget.scalableDimension,
    serviceNamespace: scalingTarget.serviceNamespace,
    targetTrackingScalingPolicyConfiguration: {
      predefinedMetricSpecification: {
        predefinedMetricType: "ECSServiceAverageMemoryUtilization",
      },
      targetValue,
      scaleInCooldown: 300,
      scaleOutCooldown: 60,
    },
  });

  return { scalingTarget, cpuScaling, memoryScaling };
};
