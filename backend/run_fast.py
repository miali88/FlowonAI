import uvicorn
from dotenv import load_dotenv
import os
import sys
from app.core.config import settings

if __name__ == "__main__":
    # Add the project root to Python path
    project_root = os.path.join(os.path.dirname(__file__), '..')
    sys.path.append(project_root)
    
    # Load environment variables
    load_dotenv(os.path.join(project_root, '.env'))
    
    # Start the server
    try:
        uvicorn.run("app.main:app", 
                    host="0.0.0.0",
                    port=8000, 
                    reload=True,
                    )
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print("Error: Port 8000 is already in use.")
            print("Please try:")
            print("1. sudo lsof -i :8000  (to see what's using the port)")
            print("2. pkill -f ngrok      (to kill ngrok processes)")
            print("3. pkill -f Python     (to kill Python processes)")
            sys.exit(1)
        raise
    #print("\n\nSUPABASE KEYS", settings.SUPABASE_URL, settings.SUPABASE_KEY)
