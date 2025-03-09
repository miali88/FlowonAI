"""
Tests for the ElevenLabs client.
"""
import os
import pytest
from unittest.mock import patch, MagicMock

from app.clients.elevenlabs_client import ElevenLabsClient

@pytest.fixture
def mock_elevenlabs():
    """
    Creates a patched ElevenLabs client for testing.
    """
    with patch('app.clients.elevenlabs_client.ElevenLabs') as mock_elevenlabs, \
         patch('app.clients.elevenlabs_client.TTS') as mock_tts:
        # Configure mock responses
        mock_voices = MagicMock()
        mock_voices.get_all.return_value.dict.return_value = {
            "voices": [
                {"voice_id": "voice1", "name": "Test Voice 1"},
                {"voice_id": "voice2", "name": "Test Voice 2"}
            ]
        }
        mock_elevenlabs.return_value.voices = mock_voices
        
        # Configure TTS mock
        mock_tts_instance = MagicMock()
        mock_tts_instance.generate.return_value = b"mock audio data"
        mock_tts.return_value = mock_tts_instance
        
        yield {
            "elevenlabs": mock_elevenlabs,
            "tts": mock_tts
        }

def test_init_with_api_key():
    """Test initialization with API key from environment."""
    with patch.dict(os.environ, {"ELEVENLABS_API_KEY": "test_api_key"}):
        client = ElevenLabsClient()
        assert client.api_key == "test_api_key"

def test_generate_audio(mock_elevenlabs):
    """Test generating audio with the ElevenLabs client."""
    client = ElevenLabsClient()
    
    # Test generating audio without saving
    audio_data = client.generate_audio(
        text="Hello, this is a test",
        voice_id="test_voice_id"
    )
    
    assert audio_data == b"mock audio data"
    mock_elevenlabs["tts"].return_value.generate.assert_called_once()

def test_generate_audio_with_save(mock_elevenlabs, tmp_path):
    """Test generating and saving audio to a file."""
    client = ElevenLabsClient()
    
    # Create a temporary file path
    save_path = str(tmp_path / "test_audio.mp3")
    
    # Test generating and saving audio
    result = client.generate_audio(
        text="Hello, this is a test",
        voice_id="test_voice_id",
        save_path=save_path
    )
    
    assert result == save_path
    # Check if the file was created with the right content
    with open(save_path, "rb") as f:
        assert f.read() == b"mock audio data"

def test_get_available_voices(mock_elevenlabs):
    """Test retrieving available voices from the API."""
    client = ElevenLabsClient()
    
    voices = client.get_available_voices()
    
    assert "voices" in voices
    assert len(voices["voices"]) == 2
    assert voices["voices"][0]["name"] == "Test Voice 1"
    assert voices["voices"][1]["name"] == "Test Voice 2"
    mock_elevenlabs["elevenlabs"].return_value.voices.get_all.assert_called_once() 