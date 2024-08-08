#!/usr/bin/env bash

set -e
set -x

echo "Running mypy..."
mypy app/api || exit 1
mypy app/core || exit 1
mypy app/email-templates || exit 1
mypy app/tests || exit 1

echo "Running ruff check..."
ruff check app || exit 1

echo "Running ruff format check..."
ruff format app --check || exit 1
