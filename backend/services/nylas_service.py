import os 
from dotenv import load_dotenv
from nylas import Client

load_dotenv()

NYLAS_API_KEY = os.getenv("NYLAS_API_KEY")
NYLAS_API_URI = os.getenv("NYLAS_API_URI")

# Initialize Nylas client
nylas = Client(
    api_key = NYLAS_API_KEY,
    api_uri = NYLAS_API_URI
)