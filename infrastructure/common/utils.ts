import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

export const createAllIpv4IngressRule = (
  securityGroupId: pulumi.Output<string>,
  sgName: string,
) => {
    return new aws.vpc.SecurityGroupIngressRule(`${sgName}-allow-ipv4-in`, {
        securityGroupId: securityGroupId,
        cidrIpv4: "0.0.0.0/0",
        ipProtocol: "-1",
    });
}

export const createAllIpv4EgressRule = (
  securityGroupId: pulumi.Output<string>,
  sgName: string,
) => {
    return new aws.vpc.SecurityGroupEgressRule(`${sgName}-allow-ipv4-out`, {
        securityGroupId: securityGroupId,
        cidrIpv4: "0.0.0.0/0",
        ipProtocol: "-1",
    });
}

export const createIpv4EgressRule = (
  securityGroupId: pulumi.Output<string>,
  sgName: string,
  ports: number[],
  protocol: string = "tcp",
) => {
  for (const port of ports) {
    new aws.vpc.SecurityGroupEgressRule(`${sgName}-allow-${protocol}-ipv4-out-${port}`, {
        securityGroupId: securityGroupId,
        cidrIpv4: "0.0.0.0/0",
        fromPort: port,
        toPort: port,
        ipProtocol: protocol,
    });
  }
}

export const createIpv4IngressRule = (
  securityGroupId: pulumi.Output<string>,
  sgName: string,
  ports: number[],
  protocol: string = "tcp",
) => {
  for (const port of ports) {
    new aws.vpc.SecurityGroupIngressRule(`${sgName}-allow-${protocol}-ipv4-in-${port}`, {
        securityGroupId: securityGroupId,
        cidrIpv4: "0.0.0.0/0",
        fromPort: port,
        toPort: port,
        ipProtocol: protocol,
    });
  }
}

export const createSourceSgIngressRule = (
  securityGroupId: pulumi.Output<string>,
  sgName: string,
  ports: number[],
  sourceSecurityGroupId: pulumi.Output<string>,
  protocol: string = "tcp",
) => {
  for (const port of ports) {
    new aws.vpc.SecurityGroupIngressRule(`${sgName}-allow-${protocol}-ipv4-in-${port}-from-sg`, {
        securityGroupId: securityGroupId,
        fromPort: port,
        toPort: port,
        ipProtocol: protocol,
        referencedSecurityGroupId: sourceSecurityGroupId,
    });
  }
}

export const createDestinationSgEgressRule = (
  securityGroupId: pulumi.Output<string>,
  sgName: string,
  ports: number[],
  destinationSecurityGroupId: pulumi.Output<string>,
  protocol: string = "tcp",
) => {
  for (const port of ports) {
    new aws.vpc.SecurityGroupEgressRule(`${sgName}-allow-${protocol}-ipv4-out-${port}-to-sg`, {
        securityGroupId: securityGroupId,
        fromPort: port,
        toPort: port,
        ipProtocol: protocol,
        referencedSecurityGroupId: destinationSecurityGroupId,
    });
  }
}
