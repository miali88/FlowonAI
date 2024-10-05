import logging
from pyngrok import ngrok

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

logging.info('Starting ngrok tunnel setup')

try:
    # Establish an HTTPS tunnel to the server running on port 3000
    https_tunnel = ngrok.connect(addr="https://localhost:8000")  # Remove subdomain parameter
    logging.info(f"ngrok tunnel 'https' established -> {https_tunnel.public_url}")
    
    # Keep the script running
    ngrok_process = ngrok.get_ngrok_process()
    try:
        ngrok_process.proc.wait()
    except KeyboardInterrupt:
        logging.info("Received keyboard interrupt. Closing tunnel...")
    finally:
        ngrok.kill()  # Kill the ngrok process on exit
        logging.info("Tunnel closed")
except Exception as e:
    logging.error(f"An error occurred: {str(e)}")
    raise
