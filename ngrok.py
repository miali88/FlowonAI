import logging
from pyngrok import ngrok

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

logging.info('Starting ngrok tunnel setup')

try:
    # Establish an HTTPS tunnel to the server running on port 3000 with a specific subdomain
    https_tunnel_3000 = ngrok.connect(addr="https://localhost:3000", subdomain="internally-wise-spaniel")
    logging.info(f"ngrok tunnel for port 3000 established -> {https_tunnel_3000.public_url}")
    
    # Establish another HTTPS tunnel to the server running on port 8000 with a random subdomain
    https_tunnel_8000 = ngrok.connect(addr="https://localhost:8000")
    logging.info(f"ngrok tunnel for port 8000 established -> {https_tunnel_8000.public_url}")
    
    # Keep the script running
    ngrok_process = ngrok.get_ngrok_process()
    try:
        ngrok_process.proc.wait()
    except KeyboardInterrupt:
        logging.info("Received keyboard interrupt. Closing tunnels...")
    finally:
        ngrok.kill()  # Kill the ngrok process on exit
        logging.info("Tunnels closed")
except Exception as e:
    logging.error(f"An error occurred: {str(e)}")
    raise
