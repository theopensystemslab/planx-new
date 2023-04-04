#!/usr/bin/env bash

# This script toggle the default root object of our CloudFront CDN which serves PlanX
# Use this to turn on/off the maintenance page during planned downtime
# 
# Arguments: 
# $1 ENVIRONMENT (Must be one of "staging" or "production")
# e.g. bash toggle-maintenance-page.sh staging

if [[ "$1" == "staging" ]]
  then ENVIRONMENT="editor.planx.dev";
elif [[ "$1" == "production" ]];
  then ENVIRONMENT="editor.planx.uk"; 
fi;

[ -z "$ENVIRONMENT" ] && echo "Error: Environment required" && exit;

CLOUDFRONT_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[*].{id:Id,alias:Aliases.Items[0]}[?alias=='${ENVIRONMENT}'].id" --output text)

[ -z "$CLOUDFRONT_ID" ] && echo "Error: CloudFront ID not found" && exit;

CURRENT_PAGE=$(aws cloudfront get-distribution --id $CLOUDFRONT_ID --query "Distribution.DistributionConfig.DefaultRootObject")

if [[ "$CURRENT_PAGE" == \"index.html\" ]]
  then NEW_PAGE="error.html";
else
  NEW_PAGE="index.html"; 
fi;

aws cloudfront update-distribution --id $CLOUDFRONT_ID --default-root-object $NEW_PAGE

echo "Complete - please visit https://${ENVIRONMENT} to test";