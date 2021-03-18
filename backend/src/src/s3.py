"""
S3 client/resource requests
"""
import base64
import boto3
from src.config import CONTENT_BUCKET_NAME, AWS_REGION, STACK_NAME

resource = boto3.resource("s3", region_name=AWS_REGION)


def put_base64_img(b64: str, img_name: str, owner_id: str) -> str:
    """
    Create new s3 obj from base64 encoded img
    Returns URL to object
    """
    b64 = b64.replace("data:image/jpeg;base64", "")
    obj = resource.Object(
        CONTENT_BUCKET_NAME, f"{STACK_NAME}/{owner_id}/{img_name}.jpg"
    )
    obj.put(Body=base64.b64decode(b64))
    return f"https://{CONTENT_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{STACK_NAME}/{owner_id}/{img_name}.jpg"

