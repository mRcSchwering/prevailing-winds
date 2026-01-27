#!/usr/bin/env bash
#
# installs all dependencies for local development and tests
# (project, dev, others)
#
uv sync --all-groups "$@"