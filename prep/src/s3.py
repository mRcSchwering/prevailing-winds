"""
Writing to S3
"""
import pickle
import boto3  # type: ignore

AWS_REGION = "eu-central-1"
CONTENT_BUCKET_NAME = "prevailing-winds-data"
resource = boto3.resource("s3", region_name=AWS_REGION)


def write_wind_obj(obj, year: int, month: int, lat: int, lng: int):
    key = f"{year:.0f}/{month:.0f}/avgwinds_{lat:.0f};{lng:.0f}.pkl"
    res = resource.Object(CONTENT_BUCKET_NAME, key).put(Body=pickle.dumps(obj))
    assert res["ResponseMetadata"]["HTTPStatusCode"] == 200
