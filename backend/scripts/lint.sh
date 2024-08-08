#!/usr/bin/env bash

set -e
set -x

echo "Running mypy..."
mypy app/api/items || exit 1
mypy app/api/login || exit 1
mypy app/api/retellai || exit 1
mypy app/api/twilio || exit 1
mypy app/api/users || exit 1
mypy app/api/vapi || exit 1
mypy app/api/utils || exit 1
mypy app/deps || exit 1
mypy app/main || exit 1


mypy app/core || exit 1
mypy app/email-templates || exit 1
mypy app/tests || exit 1

echo "Running ruff check..."
ruff check app || exit 1

echo "Running ruff format check..."
ruff format app --check || exit 1
