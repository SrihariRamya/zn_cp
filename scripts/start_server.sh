#!/bin/sh

aws s3 cp s3://zupain-secrets/$BRANCH/cp.json build/tenant-config-map.json --region ap-south-1

exec $@
