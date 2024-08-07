import pytest
from fastapi.testclient import TestClient
from backend.services.retellai.retellai import CallRouting, Outbound, AppBooking

def test_call_routing_init():
    call_routing = CallRouting({})
    assert hasattr(call_routing, 'in_memory_cache')

def test_outbound_init():
    outbound = Outbound({})
    assert hasattr(outbound, 'in_memory_cache')

def test_app_booking_init():
    app_booking = AppBooking({})
    assert hasattr(app_booking, 'in_memory_cache')

# Add more tests for individual methods of these classes