"""
Writing to S3
"""

from typing import Any, List
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


def ls_obj_keys(prefix: str) -> List[str]:
    s3_paginator = _CLIENT.get_paginator("list_objects_v2")
    keys = []
    for page in s3_paginator.paginate(
        Bucket=_CONTENT_BUCKET_NAME, Prefix=prefix, StartAfter=prefix
    ):
        assert page["ResponseMetadata"]["HTTPStatusCode"] == 200
        for content in page.get("Contents", ()):
            keys.append(content["Key"])
    return keys
