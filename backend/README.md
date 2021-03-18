# Lambda GraphQL

AWS Lambda + API Gateway for deploying GraphQL endpoints using the [SAM framework](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html).
This is basically the [SAM hello world app](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started-hello-world.html)
adapted for GraphQL endpoints.

- [SAM_README.md](./SAM_README.md) autogenerated README from SAM framework
- [template.yaml](./template.yaml) Lambda function, API gateway, and DynamoDB definitions for SAM framework
- [app.py](./app.py) ASGI app to make GraphQL development easier
- [src/](./src/) code to be included in Lambda functions
- [tests/](./tests/) pytest suite

Current backend URLs are genrated.
If for some reason I need to recreate the stack these URLs will change.

- **URL** https://ha0eqjwykj.execute-api.eu-central-1.amazonaws.com/stage/graphql/

## tldr;

```
# local app
PYTHONPATH=./src uvicorn app:app --reload

# run tests
PYTHONPATH=./src pytest tests

# redeploy
sam build && sam deploy --config-file samconfig.toml
```

## Init

Initially run guided deployment with admin rights to get bucket and API ids.
Then use created samconfig.toml for future deployments.
Note URLs from `sam deploy` STDOUT.

```
sam validate
sam build
sam deploy --guided
```

## Local App

There is an ASGI app in [app.py](./app.py) for easier GraphQL development locally.

```
# start app
PYTHONPATH=./src uvicorn app:app --reload
```

Additionally, point your vscode to the env file
for the linters to work and make your integrated terminal use it as well:

```
{
    "python.envFile": "${workspaceFolder}/dev.env",
    "terminal.integrated.shellArgs.linux": ["-c", "export `cat dev.env`; bash"]
}
```

## Tests

Run pytests in [tests/](./tests/).
Changes in yaml file can be checked with `sam validate`, but this needs AWS admin role credentials.

```
# pytests
PYTHONPATH=./src pytest tests

# check yaml (only works with aws admin role)
sam validate
```