"""
S3 client/resource requests
"""
import pickle
import boto3  # type: ignore
from src.config import CONTENT_BUCKET_NAME, AWS_REGION

resource = boto3.resource("s3", region_name=AWS_REGION)


def get_obj(years: str, month: int, lat: int, lng: int) -> dict:
    key = f"{years}/{month}/avgwinds_{lat};{lng}.pkl"
    bkt_obj = resource.Bucket(CONTENT_BUCKET_NAME).Object(key).get()
    return pickle.loads(bkt_obj["Body"].read())


def get_obj_v2(years: str, month: int, lat: int, lng: int) -> dict:
    key = f"v2/{years}/{month}/{lat}/{lng}/data.pkl"
    bkt_obj = resource.Bucket(CONTENT_BUCKET_NAME).Object(key).get()
    return pickle.loads(bkt_obj["Body"].read())

