"""
Global config env vars > defaults

Environment variables have to be defined in template.yaml
as environment variables for Lambda functions.
"""
import datetime as dt

UTC_NOW = dt.datetime.utcnow()
UTC_NOW_TS = UTC_NOW.timestamp()

# AWS
AWS_REGION = "eu-central-1"
CONTENT_BUCKET_NAME = "prevailing-winds-data"

# CORS
# Note: this sets the response headers while the CORS config
#       in template.yaml creates an OPTIONS endpoint
CORS_ALLOW_ORIGIN = "*"

