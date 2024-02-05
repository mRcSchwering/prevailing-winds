from ariadne.explorer import ExplorerGraphiQL


def lambda_handler(*_):
    return {
        "statusCode": 200,
        "body": ExplorerGraphiQL().html(None),
        "headers": {"Content-Type": "text/html"},
    }
