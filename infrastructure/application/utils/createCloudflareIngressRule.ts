import * as aws from "@pulumi/aws";
import * as cloudflare from "@pulumi/cloudflare";
import * as pulumi from "@pulumi/pulumi";

/**
 * Restrict ALB ingress to Cloudflare IP ranges only.
 * We fetch current Cloudflare CIDRs at deploy time via their API to stay up to date.
 */
// TODO: remove port 80 (http) once Cloudflare SSL mode is set to 'Full (Strict)' and all traffic is https
export const createCloudflareIngressRules = async (
  securityGroupId: pulumi.Output<string>,
  sgName: string,
  ports: number[] = [80, 443],
) => {
  const { ipv4Cidrs } = await cloudflare.getIpRanges();

  for (const port of ports) {
    ipv4Cidrs.forEach((cidr, i) => {
      new aws.vpc.SecurityGroupIngressRule(`${sgName}-allow-tcp-in-${port}-from-cloudflare-${i}`, {
        securityGroupId,
        cidrIpv4: cidr,
        fromPort: port,
        toPort: port,
        ipProtocol: "tcp",
      });
    });
  }
};
