"""
ElevenLabs API client for text-to-speech synthesis.

This module provides a simplified interface for generating audio from text
using the ElevenLabs API.
"""

import os
import logging
from typing import Optional, Dict, Any, Union

from elevenlabs import ElevenLabs, Voice

logger = logging.getLogger(__name__)

class ElevenLabsClient:
    """Client for interacting with the ElevenLabs text-to-speech API."""
    
    def __init__(self):
        """Initialize the ElevenLabs client using API key from environment variables."""
        self.api_key = os.getenv("ELEVENLABS_API_KEY")
        if not self.api_key:
            logger.warning("ELEVENLABS_API_KEY not found in environment variables")
        
        self.client = ElevenLabs(api_key=self.api_key)
    
    def generate_audio(
        self, 
        text: str, 
        voice_id: str,
        model_id: Optional[str] = None,
        output_format: str = "mp3",
        save_path: Optional[str] = None
    ) -> Union[bytes, str]:
        """
        Generate audio from text using ElevenLabs API.
        
        Args:
            text: The text to convert to speech
            voice_id: The ID of the voice to use
            model_id: Optional model ID (defaults to ElevenLabs default model)
            output_format: Audio output format (mp3, wav, etc.)
            save_path: Optional path to save the audio file
            
        Returns:
            Audio bytes if save_path is None, otherwise the path to saved file
        """
        try:
            logger.info(f"Generating audio for text of length {len(text)} with voice {voice_id}")
            
            voice = Voice(id=voice_id, name="", category="")
            
            if model_id:
                audio = self.client.text_to_speech.convert(text=text, voice=voice, model=model_id, output_format=output_format)
            else:
                audio = self.client.text_to_speech.convert(text=text, voice=voice, output_format=output_format)
            
            if save_path:
                with open(save_path, "wb") as f:
                    f.write(audio)
                logger.info(f"Audio saved to {save_path}")
                return save_path
            
            return audio
            
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
