import uvicorn
from dotenv import load_dotenv
import os
from app.core.config import settings

if __name__ == "__main__":
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
    uvicorn.run("app.main:app", 
                host="0.0.0.0",
                port=8000, 
                reload=True,
                ssl_keyfile="localhost.key",
                ssl_certfile="localhost.crt"
                )
    #print("\n\nSUPABASE KEYS", settings.SUPABASE_URL, settings.SUPABASE_KEY)
