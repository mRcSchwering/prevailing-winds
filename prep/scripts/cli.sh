#!/usr/bin/env bash
#
# run CLI command in environment after asserting that
# the environment and uv.lock is in sync with pyproject.toml
#
uv run --locked python -m main "$@"