from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.responses import Response, JSONResponse
from supabase import create_client
import os  # Add this import


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
