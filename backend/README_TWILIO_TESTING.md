# Testing the Twilio Phone Number Provisioning Flow

This document provides instructions for testing the Twilio phone number provisioning flow in the FlowOn backend.

## Overview

The phone number provisioning flow involves several steps:
1. Authentication check
2. Check if user already has a number
3. Get available numbers from Twilio
4. Purchase a number from Twilio
5. Store the number in multiple database tables
6. Register the number with LiveKit SIP trunk system

This flow interacts with multiple external services (Twilio API, Supabase database, LiveKit), making it complex to test and debug.

## Testing Approaches

### 1. Unit Tests

Unit tests with mocked dependencies are available at `backend/tests/services/twilio/test_numbers.py`.

To run the unit tests:

```bash
# Run all Twilio service tests
python -m pytest backend/tests/services/twilio -v

# Run specific test file
python -m pytest backend/tests/services/twilio/test_numbers.py -v

# Run with coverage
python -m pytest backend/tests/services/twilio --cov=app.services.twilio
```

### 2. API Integration Tests

API integration tests for the FastAPI endpoints are available at `backend/tests/api/test_twilio_routes.py`.

To run the API tests:

```bash
# Run all Twilio API tests
python -m pytest backend/tests/api/test_twilio_routes.py -v
```

### 3. Flow Visualization Testing

For a more visual and detailed understanding of the flow, we've created enhanced versions of the services with detailed logging and flow tracking.

#### Flow-Enhanced Version

The file `backend/app/services/twilio/flow_enhanced_numbers.py` contains a version of the number provisioning service with detailed flow tracking. It uses the `FlowTracker` utility to log and visualize each step of the process.

#### Test Script

A test script is available at `backend/scripts/test_number_provision.py` that runs the flow with mock external services.

To run the test script:

```bash
# Run from project root
python -m backend.scripts.test_number_provision
```

This will run two test scenarios:
1. New user without a phone number
2. Existing user with a phone number

The output will show a detailed log of each step in the flow, making it easier to understand and debug the process.

## Manual Testing

For manual testing during development, you can:

1. Use the flow-enhanced version of the service in your development environment
2. Call the FastAPI endpoint with appropriate parameters
3. Analyze the logs to understand the flow

Example endpoint call:

```bash
curl -X POST "http://localhost:8000/api/twilio/purchase_phone_number?country_code=US&number_type=local" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

## Debugging Tips

1. **Log Level**: Set the log level to DEBUG to see detailed logs
2. **Flow Tracking**: The FlowTracker utility helps visualize the execution flow
3. **Mock Services**: Use mock services for Twilio, Supabase, and LiveKit to avoid real API calls during testing
4. **Error Handling**: Check the error handling in each step of the flow

## Testing in Production-Like Environment

For testing in a staging environment:

1. Create test users with `is_trial=true`
2. Use a Twilio sandbox or test account
3. Monitor the logs for each step of the process
4. Verify the database entries in all relevant tables

## Common Issues

1. **Missing Dependencies**: Make sure all required environment variables are set for Twilio, Supabase, and LiveKit
2. **Database Permissions**: Ensure the test user has proper permissions in the database
3. **API Rate Limits**: Be aware of Twilio API rate limits during testing
4. **Cleanup**: Make sure to clean up test data after running tests to avoid cluttering the database 