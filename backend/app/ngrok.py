print('in ngrok.py')
from pyngrok import ngrok

# Establish an HTTPS tunnel to the Uvicorn server running on port 80
https_tunnel = ngrok.connect('https://0.0.0.0:80/', subdomain='internally-wise-spaniel')
print(f"ngrok tunnel 'https' -> {https_tunnel.public_url}")

# Keep the script running
try:
    while True:
        pass
except KeyboardInterrupt:
    ngrok.disconnect(https_tunnel.public_url)
    print("Tunnel closed")
