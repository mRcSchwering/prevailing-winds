from ariadne.constants import PLAYGROUND_HTML  # type: ignore


def lambda_handler(*_):
    return {
        "statusCode": 200,
        "body": PLAYGROUND_HTML,
        "headers": {"Content-Type": "text/html"},
    }
