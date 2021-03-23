"""
S3 client/resource requests
"""
import pickle
import boto3
from src.config import CONTENT_BUCKET_NAME, AWS_REGION

resource = boto3.resource("s3", region_name=AWS_REGION)


def get_obj(years: str, month: int, lat: int, lng: int) -> dict:
    key = f"{years}/{month}/avgwinds_{lat};{lng}.pkl"
    bkt_obj = resource.Bucket(CONTENT_BUCKET_NAME).Object(key).get()
    return pickle.loads(bkt_obj["Body"].read())

