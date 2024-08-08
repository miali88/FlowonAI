#!/usr/bin/env bash

set -e
set -x

echo "Running mypy..."
mypy app || exit 1

echo "Running ruff check..."
ruff check app || exit 1

echo "Running ruff format check..."
ruff format app --check || exit 1
