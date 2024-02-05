"""
Handler Lambda functions triggered by API Gateway events
"""

import json
from src.config import CORS_ALLOW_ORIGIN


class Event:
    """
    Class for AWS Lambda handler's event dict from API Gateway event.

    API Gateway Lambda Proxy Input Format
    Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
    """

    def __init__(
        self,
        resource: str,
        path: str,
        httpMethod: str,
        headers: dict,
        isBase64Encoded: bool | None = None,
        apiId: str | None = None,
        protocol: str | None = None,
        body: str | None = None,
        resourcePath: str | None = None,
        queryStringParameters: dict | None = None,
        pathParameters: dict | None = None,
        stageVariables: dict | None = None,
        requestContext: dict | None = None,
        multiValueHeaders: dict | None = None,
        multiValueQueryStringParameters: dict | None = None,
        **_,
    ):
        self.resource = resource
        self.path = path
        self.http_method = httpMethod
        self.resource_path = resourcePath
        self.headers = headers

        self.is_base64_encoded = isBase64Encoded
        self.api_id = apiId
        self.protocol = protocol

        self.body: dict | None = None
        if body is not None:
            try:
                self.body = json.loads(body)
            except (TypeError, json.decoder.JSONDecodeError):
                pass

        self.query_str_params = queryStringParameters
        self.path_params = pathParameters
        self.stage_variables = stageVariables
        self.request_context = requestContext
        self.multi_value_headers = multiValueHeaders
        self.multi_value_query_str_params = multiValueQueryStringParameters

    def __repr__(self) -> str:
        args = {
            "resource": self.resource,
            "path": self.path,
            "http_method": self.http_method,
            "resource_path": self.resource_path,
            "headers": self.headers,
            "body": self.body,
        }
        args_strs = [f"{k}={d}" for k, d in args.items()]
        return f"Event({', '.join(args_strs)})"


class Context:
    """
    Described Context class that AWS Lambda handler function gets as `context`.

    Lambda Context runtime methods and attributes
    Context doc: https://docs.aws.amazon.com/lambda/latest/dg/python-context-object.html
    """

    class Identity:
        cognito_identity_id: str = "The authenticated Amazon Cognito identity."
        cognito_identity_pool_id: str = (
            "The Amazon Cognito identity pool that authorized the invocation."
        )

    class ClientContext:
        custom: str = "A dict of custom values set by the mobile client application."
        env: str = "A dict of environment information provided by the AWS SDK."

        class Client:
            installation_id: str = "installation_id"
            app_title: str = "app_title"
            app_version_name: str = "app_version_name"
            app_version_code: str = "app_version_code"
            app_package_name: str = "app_package_name"

    function_name: str = "The name of the Lambda function"
    function_version: str = "The version of the function"
    invoked_function_arn: str = (
        "The Amazon Resource Name (ARN) that's used to invoke the function. Indicates if the invoker specified a version number or alias"
    )
    memory_limit_in_mb: str = "The amount of memory that's allocated for the function"
    aws_request_id: str = "The identifier of the invocation request"
    log_group_name: str = "The log group for the function"
    log_stream_name: str = "The log stream for the function instance"
    identity: Identity = Identity()
    client_context: ClientContext = ClientContext()

    def get_remaining_time_in_millis(self) -> int:
        return 1000


def form_output(status: int, body: dict) -> dict:
    """
    API Gateway Lambda Proxy Output Format: dict
    Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
    """
    headers = {"access-control-allow-origin": CORS_ALLOW_ORIGIN}
    return {"statusCode": status, "body": json.dumps(body), "headers": headers}
