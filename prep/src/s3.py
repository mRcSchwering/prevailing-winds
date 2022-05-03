"""
Writing to S3
"""
from typing import Any
import pickle
import boto3  # type: ignore

_AWS_REGION = "eu-central-1"
_CONTENT_BUCKET_NAME = "prevailing-winds-data"
_CLIENT = boto3.client("s3", region_name=_AWS_REGION)


def get_obj(key: str) -> Any:
    res = _CLIENT.get_object(Bucket=_CONTENT_BUCKET_NAME, Key=key)
    assert res["ResponseMetadata"]["HTTPStatusCode"] == 200
    return pickle.loads(res["Body"].read())


def put_obj(key: str, obj: Any):
    res = _CLIENT.put_object(
        Bucket=_CONTENT_BUCKET_NAME, Key=key, Body=pickle.dumps(obj)
    )
    assert res["ResponseMetadata"]["HTTPStatusCode"] == 200
