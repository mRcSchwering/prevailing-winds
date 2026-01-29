#!/usr/bin/env bash
#
# build the sam app to .aws-sam/
#
set -e

uv export --locked --no-dev --no-editable -o src/requirements.txt
uv run --locked sam build "$@"
#rm src/requirements.txt