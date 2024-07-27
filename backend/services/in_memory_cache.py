from threading import Lock
import json

class InMemoryCache:
    def __init__(self):
        self._mem_cache = {}
        self._lock = Lock()

    def get(self, key, default=None):
        with self._lock:
            keys = key.split('.')
            value = self._mem_cache
            for k in keys:
                if isinstance(value, dict):
                    value = value.get(k)
                    if value is None:
                        return default
                else:
                    return default
            return value

    def set(self, key, value):
        with self._lock:
            keys = key.split('.')
            d = self._mem_cache
            for k in keys[:-1]:
                if k not in d:
                    d[k] = {}
                d = d[k]
            d[keys[-1]] = value

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

# Create an instance of the cache
in_memory_cache = InMemoryCache()