"""
Pytest config and test cli tool

    PYTHONPATH=./src python -m tests.conftest
"""
import json
from typing import Optional


DEFAULT_EVENT = {
    "body": '{ "test": "body"}',
    "resource": "/{proxy+}",
    "requestContext": {
        "resourceId": "123456",
        "apiId": "1234567890",
        "resourcePath": "/{proxy+}",
        "httpMethod": "POST",
        "requestId": "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
        "accountId": "123456789012",
        "identity": {
            "apiKey": "",
            "userArn": "",
            "cognitoAuthenticationType": "",
            "caller": "",
            "userAgent": "Custom User Agent String",
            "user": "",
            "cognitoIdentityPoolId": "",
            "cognitoIdentityId": "",
            "cognitoAuthenticationProvider": "",
            "sourceIp": "127.0.0.1",
            "accountId": "",
        },
        "stage": "prod",
    },
    "queryStringParameters": {"foo": "bar"},
    "headers": {
        "Via": "1.1 08f323deadbeefa7af34d5feb414ce27.cloudfront.net (CloudFront)",
        "Accept-Language": "en-US,en;q=0.8",
        "CloudFront-Is-Desktop-Viewer": "true",
        "CloudFront-Is-SmartTV-Viewer": "false",
        "CloudFront-Is-Mobile-Viewer": "false",
        "X-Forwarded-For": "127.0.0.1, 127.0.0.2",
        "CloudFront-Viewer-Country": "US",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Upgrade-Insecure-Requests": "1",
        "X-Forwarded-Port": "443",
        "Host": "1234567890.execute-api.us-east-1.amazonaws.com",
        "X-Forwarded-Proto": "https",
        "X-Amz-Cf-Id": "aaaaaaaaaae3VYQb9jd-nvCd-de396Uhbp027Y2JvkCPNLmGJHqlaA==",
        "CloudFront-Is-Tablet-Viewer": "false",
        "Cache-Control": "max-age=0",
        "User-Agent": "Custom User Agent String",
        "CloudFront-Forwarded-Proto": "https",
        "Accept-Encoding": "gzip, deflate, sdch",
    },
    "pathParameters": {"proxy": "/examplepath"},
    "httpMethod": "POST",
    "stageVariables": {"baz": "qux"},
    "path": "/examplepath",
}


def event_fact(query: str, headers: Optional[dict] = None) -> dict:
    """Get event dict with desired query in body"""
    event: dict = DEFAULT_EVENT.copy()
    if headers is not None:
        event["headers"].update(headers)
    event["body"] = json.dumps({"query": query})
    return event
