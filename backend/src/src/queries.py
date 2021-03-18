"""GraphQL Query resolvers"""
from ariadne import QueryType  # type: ignore
from src.__version__ import CI_PIPELINE_ID, BUILD_DATE


query = QueryType()


@query.field("meta")
def resolve_meta(*_, **unused):
    del unused
    return {"ciPipelineId": CI_PIPELINE_ID, "buildDate": BUILD_DATE}


queries = (query,)

