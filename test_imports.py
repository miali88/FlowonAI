import sys
print("Python Path:")
for path in sys.path:
    print(path)

print("\nTrying imports...")
try:
    import livekit.agents
    print("Successfully imported livekit.agents")
    print("Location:", livekit.agents.__file__)
except ImportError as e:
    print("Failed to import livekit_agents:", e)

try:
    from livekit import agents
    print("Successfully imported livekit.agents")
except ImportError as e:
    print("Failed to import livekit.agents:", e)