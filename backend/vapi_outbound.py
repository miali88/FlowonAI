from vapi_python import Vapi
import os 
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("VAPI_API_PUBLIC_KEY")

if not api_key:
    raise ValueError("VAPI_API_KEY is not set in the environment variables")


client = Vapi(
    api_key=api_key,
)
agent_id = "bc358757-e520-4374-af26-4dc441c89051"

client.start(assistant_id=agent_id)