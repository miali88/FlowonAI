"""
ElevenLabs API client for text-to-speech synthesis.

This module provides a simplified interface for generating audio from text
using the ElevenLabs API.
"""

import os
import uuid
from app.core.logging_setup import logger
from typing import Optional, Dict, Any, Union
from dotenv import load_dotenv
from elevenlabs import ElevenLabs, Voice

load_dotenv()

class ElevenLabsClient:
    """Client for interacting with the ElevenLabs text-to-speech API."""
    
    def __init__(self):
        """Initialize the ElevenLabs client using API key from environment variables."""
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        if not self.api_key:
            logger.warning("ELEVENLABS_API_KEY not found in environment variables")
        
        self.client = ElevenLabs(api_key=self.api_key)
        
        # Create audio directory if it doesn't exist
        self.audio_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "audio")
        os.makedirs(self.audio_dir, exist_ok=True)
    
    def generate_audio(
        self, 
        text: str, 
        voice_id: str,
        model_id: Optional[str] = 'eleven_multilingual_v2',
        output_format: str = "mp3_44100_96",
        save_path: Optional[str] = None,
        return_bytes: bool = True
    ) -> Union[bytes, str]:
        """
        Generate audio from text using ElevenLabs API.
        
        Args:
            text: The text to convert to speech
            voice_id: The ID of the voice to use
            model_id: Optional model ID (defaults to ElevenLabs default model)
            output_format: Audio output format (mp3, wav, etc.)
            save_path: Optional path to save the audio file
            return_bytes: Whether to return raw bytes (default is now True)
            
        Returns:
            Audio bytes by default, or file path if return_bytes=False
        """
        try:
            logger.info(f"Generating audio for text of length {len(text)} with voice {voice_id}")
            
            # Generate a unique filename if save_path is provided or we're not returning bytes
            if save_path or not return_bytes:
                if not save_path:
                    filename = f"{uuid.uuid4()}.mp3"
                    save_path = os.path.join(self.audio_dir, filename)
            
            # Get the audio from ElevenLabs
            audio_generator = self.client.text_to_speech.convert(voice_id=voice_id, text=text, model_id=model_id, output_format=output_format)

            # Convert generator to bytes
            audio_bytes = b"".join(list(audio_generator))
            
            # Save the audio to a file if needed
            if save_path or not return_bytes:
                with open(save_path, "wb") as f:
                    f.write(audio_bytes)
                logger.info(f"Audio saved to {save_path}")
            
            # Return the bytes if requested, otherwise return the file path
            if return_bytes:
                return audio_bytes
            
            # Return a URL path for frontend access (simple approach)
            return f"/static/audio/{os.path.basename(save_path)}"
            
        except Exception as e:
            logger.error(f"Error generating audio with ElevenLabs: {str(e)}")
            raise
    
    def get_available_voices(self) -> Dict[str, Any]:
        """
        Get a list of available voices from ElevenLabs.
        
        Returns:
            Dictionary containing voice information
        """
        try:
            voices = self.client.voices.get_all().dict()
            return voices
        except Exception as e:
            logger.error(f"Error fetching voices from ElevenLabs: {str(e)}")
            raise

# Create a singleton instance
elevenlabs_client = ElevenLabsClient()
