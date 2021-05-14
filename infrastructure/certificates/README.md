# Certificates

This stack holds the SSL certificates. We've moved them into a separate stack to avoid constant re-issuing, which leads to this error: `LimitExceededException: Error: you have reached your limit of 20 certificates in the last year`. You see, every time we do `pulumi up` a new certificate is issued, so we try and avoid doing that very often. This is a limitation on AWS's part not Pulumi (e.g. [AWS CDK suffers the same problem](https://github.com/aws/aws-cdk/issues/5889)).
