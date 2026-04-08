import * as aws from "@pulumi/aws";

// XXX: Originally, our certificate (generated in the `certificates` stack) was created in eu-west-2 (London), however, later we wanted to add CloudFront which only accepts certificates generated in the us-east-1 region. Hence, this here is duplicate code which should be merged into the `certificate` stack.
export const usEast1 = new aws.Provider("useast1", { region: "us-east-1" });