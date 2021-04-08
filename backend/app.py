"""
ASGI app for easier development

    PYTHONPATH=./src uvicorn app:app --reload

CORS methods are set here using starlette middleware, but in the deployed
lambda function they are added differently (template.yaml, lambda handler)
"""
from ariadne.asgi import GraphQL  # type: ignore
from starlette.middleware.cors import CORSMiddleware  # type: ignore
from graphql_post import schema  # type: ignore


app = CORSMiddleware(
    GraphQL(schema), allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

