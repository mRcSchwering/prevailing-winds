"""GraphQL Query resolvers"""
from ariadne import QueryType  # type: ignore
from src.__version__ import CI_PIPELINE_ID, BUILD_DATE
from src.config import wind_vel_i2k, wind_vel_i2b, wind_dir_i2k
import src.s3 as s3


query = QueryType()


@query.field("meta")
def resolve_meta(*_, **unused):
    del unused
    return {"ciPipelineId": CI_PIPELINE_ID, "buildDate": BUILD_DATE}


@query.field("testPkl")
def resolve_test_pkl(*_, **unused):
    del unused
    obj = s3.test_read_obj_pkl()
    records = []
    for wind, count in obj.items():
        dir_i, vel_i = wind
        record = {
            "dir": wind_dir_i2k[dir_i],
            "vel": wind_vel_i2b[vel_i],
            "velName": wind_vel_i2k[vel_i],
            "count": count,
        }
        records.append(record)
    return records


queries = (query,)

