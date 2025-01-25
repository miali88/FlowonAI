import uvicorn
from dotenv import load_dotenv
import os
import sys

if __name__ == "__main__":
    # Add the project root to Python path
    project_root = os.path.join(os.path.dirname(__file__), '..')
    sys.path.append(project_root)

    # Load environment variables
    load_dotenv(os.path.join(project_root, '.env'))

    # Start the server
    uvicorn.run("app.main:app",
                host="0.0.0.0",
                port=8000,
                reload=True,
                )
    # print("\n\nSUPABASE KEYS", settings.SUPABASE_URL, settings.SUPABASE_KEY)
