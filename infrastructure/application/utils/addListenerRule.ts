import * as aws from "@pulumi/aws";

/**
 * Restrict access to ELB directly by redirecting all traffic via our DNS
 * This ensures that Cloudflare proxies all requests
 */
export const addRedirectToCloudflareListenerRule = async ({ serviceName, listenerArn, listenerLabel, domain }: {
  serviceName: string;
  listenerArn: aws.lb.Listener["arn"];
  listenerLabel: string;
  domain: string;
}) => {
  return new aws.lb.ListenerRule(`${serviceName}-${listenerLabel}-redirectToCloudflare`, {
    listenerArn,
    priority: 100,
    actions: [{
      type: "redirect",
      redirect: {
        host: `${serviceName}.${domain}`,
        port: "443",
        protocol: "HTTPS",
        statusCode: "HTTP_301",
      },
    }],
    conditions: [{
      hostHeader: {
        values: [`${serviceName}-*-*.eu-west-2.elb.amazonaws.com`],
      }
    }],
  });
};
