"""
Writing to S3
"""
from typing import Any
import pickle
import boto3  # type: ignore

AWS_REGION = "eu-central-1"
CONTENT_BUCKET_NAME = "prevailing-winds-data"
CLIENT = boto3.client("s3", region_name=AWS_REGION)


def get_obj(key: str) -> Any:
    res = CLIENT.get_object(Bucket=CONTENT_BUCKET_NAME, Key=key)
    assert res["ResponseMetadata"]["HTTPStatusCode"] == 200
    return pickle.loads(res["Body"].read())


def put_obj(key: str, obj: Any):
    res = CLIENT.put_object(Bucket=CONTENT_BUCKET_NAME, Key=key, Body=pickle.dumps(obj))
    assert res["ResponseMetadata"]["HTTPStatusCode"] == 200

