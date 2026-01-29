#!/usr/bin/env bash
#
# build the sam app to .aws-sam/
#
set -e

uv export --locked --no-editable -o src/requirements.txt
sam build "$@"
rm src/requirements.txt