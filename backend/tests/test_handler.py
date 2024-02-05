"""
Smoke tests for lambda function and handler itself.
"""

import json
from unittest.mock import patch
from ariadne.types import GraphQLResolveInfo
from ariadne import make_executable_schema, QueryType
from graphql_post import lambda_handler
from tests.conftest import event_fact

query = QueryType()


@query.field("testHeaders")
def resolve_meta(_, info: GraphQLResolveInfo, **unused):
    del unused
    context = info.context
    headers = context["request"].headers
    return {"Authorization": headers.get("Authorization")}


SCHEMA_DEF = """
    type Query {
        testHeaders: Meta!
    }
    type Meta {
        Authorization: String!
    }
"""

schema = make_executable_schema(SCHEMA_DEF, query)


def test_lambda_handler_on_meta():
    event = event_fact("query { meta {ciPipelineId, buildDate} }")
    resp = lambda_handler(event, "")
    assert resp["statusCode"] == 200
    data = json.loads(resp["body"])["data"]
    assert isinstance(data["meta"]["ciPipelineId"], str)
    assert isinstance(data["meta"]["buildDate"], str)


def test_headers_passed_through():
    event = event_fact(
        "query { testHeaders {Authorization} }", headers={"Authorization": "asd"}
    )

    with patch("graphql_post.schema", schema):
        resp = lambda_handler(event, "")

    assert resp["statusCode"] == 200
    headers = json.loads(resp["body"])["data"]["testHeaders"]
    assert headers["Authorization"] == "asd"
