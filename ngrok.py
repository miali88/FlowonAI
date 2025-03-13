import logging
from pyngrok import ngrok

# Configure logging for the main application
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Set pyngrok logger to only show WARNING and above
pyngrok_logger = logging.getLogger("pyngrok")
pyngrok_logger.setLevel(logging.WARNING)

logging.info('Starting ngrok tunnel setup')

"""
To run:
python ngrok.py

to monitor traffic, visit:
http://127.0.0.1:4040/inspect/http
"""

try:

    """ static domain - Frontend (Vite)"""
    port = 8000
    http_tunnel_static = ngrok.connect(addr=f"http://localhost:{port}", subdomain="internally-wise-spaniel")
    logging.info(f"Frontend (Vite) running on:\n"
                f"  - Local: http://localhost:{port}\n"
                f"  - Ngrok: {http_tunnel_static.public_url}")
    
    # """ dynamic domain"""   
    # port = 5185
    # http_tunnel_dynamic = ngrok.connect(addr=f"http://localhost:{port}")
    # logging.info(f"ngrok tunnel for port {port} established -> {http_tunnel_dynamic.public_url}")


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
