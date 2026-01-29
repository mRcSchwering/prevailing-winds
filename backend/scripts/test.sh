#!/usr/bin/env bash
#
# run functional tests after asserting that
# the environment and uv.lock is in sync with pyproject.toml
#
PYTHONPATH=src uv run --locked pytest "$@"