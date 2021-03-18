"""
S3 client/resource requests
"""
import pickle
import json
import boto3
from src.config import CONTENT_BUCKET_NAME, AWS_REGION

resource = boto3.resource("s3", region_name=AWS_REGION)


def test_read_obj_pkl():
    bkt_obj = (
        resource.Bucket(CONTENT_BUCKET_NAME).Object("2020/1/avgwinds_40;20.pkl").get()
    )
    return pickle.loads(bkt_obj["Body"].read())


def test_read_obj_json():
    bkt_obj = (
        resource.Bucket(CONTENT_BUCKET_NAME).Object("2020/1/avgwinds_40;20.json").get()
    )
    return json.loads(bkt_obj["Body"].read())

