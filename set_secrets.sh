#!/bin/bash

# Read from .env file and set as GitHub secrets
while IFS='=' read -r key value
do
  # Trim leading and trailing whitespace from key and value
  key=$(echo "$key" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  value=$(echo "$value" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
  
  # Skip empty lines and comments
  if [[ -n "$key" && ! "$key" =~ ^# ]]; then
    echo "Setting secret: $key"
    gh secret set "$key" -b "$value" || echo "Failed to set secret: $key"
  fi
done < .env