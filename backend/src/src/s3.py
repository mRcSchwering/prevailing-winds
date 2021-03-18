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
    pkl_obj = bkt_obj["Body"].read()
    obj = pickle.loads(pkl_obj)
    return len(obj)


def test_read_obj_json():
    bkt_obj = (
        resource.Bucket(CONTENT_BUCKET_NAME).Object("2020/1/avgwinds_40;20.json").get()
    )
    json_obj = bkt_obj["Body"].read()
    obj = json.loads(json_obj)
    return len(obj)

