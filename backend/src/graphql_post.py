"""
GraphQL POST entrypoint
"""

from ariadne import graphql_sync
from src.handler import Event, Context, form_output
from src.schema import schema


def lambda_handler(event_dict: dict, _: Context):
    event = Event(**event_dict)
    success, result = graphql_sync(
        schema=schema, data=event.body, context_value={"request": event}
    )
    return form_output(status=200 if success else 400, body=result)
