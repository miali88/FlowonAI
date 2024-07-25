from flowon_ai.backend.services.in_memory_cache import shared_state

print(shared_state)

shared_state.set(123, 123)

print(shared_state)