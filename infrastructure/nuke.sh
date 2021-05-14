#!/usr/bin/env sh

# *WARNING*:
# - aws-nuke allows you to *DESTROY ALL RESOURCES ON AN AWS ACCOUNT*
# - it's useful when you're working on the infra and you need a clean slate
# - make sure to only run this against staging, although executing the program presents manual checks to prevent mistakes

tee /tmp/aws-nuke.yml << EOF
regions:
- us-east-1
- eu-west-2
- global

account-blocklist:
- "999999999999" # TODO: insert production account id here

accounts:
  "781751952389": {} # Our staging account

resource-types:
  excludes: # We exclude "IAMUser*" so that aws-nuke doesn't delete its own access key
  - IAMUser
  - IAMUserPolicyAttachment
  - IAMUserAccessKey
EOF
docker run \
    --rm -it \
    -v "/tmp/aws-nuke.yml:/home/aws-nuke/config.yml" \
    quay.io/rebuy/aws-nuke:v2.15.0 \
    --config /home/aws-nuke/config.yml \
    --access-key-id "$AWS_ACCESS_KEY_ID" \
    --secret-access-key "$AWS_SECRET_ACCESS_KEY" $*
