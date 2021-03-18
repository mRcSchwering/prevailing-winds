"""GraphQL Query resolvers"""
from ariadne import QueryType  # type: ignore
from src.__version__ import CI_PIPELINE_ID, BUILD_DATE
from src.s3 import test_read_obj_json, test_read_obj_pkl


query = QueryType()


@query.field("meta")
def resolve_meta(*_, **unused):
    del unused
    return {"ciPipelineId": CI_PIPELINE_ID, "buildDate": BUILD_DATE}


@query.field("testJson")
def resolve_test_json(*_, **unused):
    del unused
    return test_read_obj_json()


@query.field("testPkl")
def resolve_test_pkl(*_, **unused):
    del unused
    return test_read_obj_pkl()


queries = (query,)

