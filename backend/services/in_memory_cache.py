from threading import Lock
import json

class InMemoryCache:
    def __init__(self):
        self._mem_cache = {}
        self._lock = Lock()

    def get(self, key, default=None):
        with self._lock:
            return self._mem_cache.get(key, default)

    def set(self, key, value):
        with self._lock:
            self._mem_cache[key] = value

    def clear(self):
        with self._lock:
            self._mem_cache.clear()

    def get_all(self):
        with self._lock:
            return dict(self._mem_cache)

    def __str__(self):
        with self._lock:
            return json.dumps(self._mem_cache, indent=2)

    def __repr__(self):
        return self.__str__()

in_memory_cache = InMemoryCache()