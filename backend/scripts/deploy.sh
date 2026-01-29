#!/usr/bin/env bash
#
# deploy the sam app from .aws-sam/
#
uv run --locked sam deploy "$@"