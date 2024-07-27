from in_memory_cache import in_memory_cache

in_memory_cache.set(f"{'agent_type'}.case_locator",{'admin_name': 'wewew', 'case': 'asdsd'})

print(in_memory_cache.get_all())
