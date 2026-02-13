import * as aws from "@pulumi/aws";

/**
 * Restrict access to ELB directly by redirecting all traffic via our DNS
 * This ensures that CloudFlare proxies all requests
 */
export const addRedirectToCloudFlareListenerRule = async ({ serviceName, listener, domain }: {
  serviceName: string;
  listener: aws.lb.Listener;
  domain: string;
}) => {
  new aws.lb.ListenerRule(`${serviceName}-redirectToCloudFlare`, {
    listenerArn: listener.arn,
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
