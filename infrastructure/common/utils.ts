import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

import type { DbUrlArgs, CustomDomain } from "./types";

// PG docs: https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING-URIS
// the AWS DB host/endpoint/address/URI will be of the form `instance.xxx.region.rds.amazonaws.com`
export const getPostgresDbUrl = ({
  role,
  password,
  host,
  port = 5432,
  database = 'postgres',
}: DbUrlArgs): string => {
  // the `postgres://` prefix provides a means of locating the resource, so this is a URL, not just a URI
  return `postgres://${role}:${password}@${host}:${port}/${database}`
}

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

// get domains still served by their own dedicated CloudFront distribution + BYO certificate
export const getLegacyDomains = (customDomains: CustomDomain[]) => customDomains.filter(cd => cd.isLegacy == true);

// get domains with DNS validation pending — added to 'mining' cert to surface records to send to council
export const getPendingDomains = (customDomains: CustomDomain[]) => customDomains.filter(cd => cd.isReady == false);

// get domains validated and ready to be served by the single shared CloudFront distribution
export const getValidatedDomains = (customDomains: CustomDomain[]) => customDomains.filter(cd => cd.isReady == true);
