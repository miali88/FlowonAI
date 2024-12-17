import logging
from pyngrok import ngrok

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

logging.info('Starting ngrok tunnel setup')

try:

    """ static domain"""
    port = 5175
    http_tunnel_static = ngrok.connect(addr=f"http://localhost:{port}", subdomain="internally-wise-spaniel")
    logging.info(f"ngrok tunnel for port {port} established -> {http_tunnel_static.public_url}")
    
    """ dynamic domain"""   
    port = 5180
    http_tunnel_dynamic = ngrok.connect(addr=f"http://localhost:{port}")
    logging.info(f"ngrok tunnel for port {port} established -> {http_tunnel_dynamic.public_url}")

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
