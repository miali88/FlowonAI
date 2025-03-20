"""
VAPI Agent Configuration Module

This module provides configuration settings and helper functions for VAPI AI phone assistants.
It includes default configurations and functions to build agent payloads.
"""

import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Default configuration settings
DEFAULT_VOICE_CONFIG = {
    "model": "eleven_multilingual_v2",
    "speed": 1,
    "provider": "11labs",
    "stability": 0.5,
    "similarityBoost": 0.75
}

DEFAULT_MODEL_CONFIG = {
    "model": "gpt-4o",
    "provider": "openai",
    "temperature": 0.3
}

DEFAULT_TRANSCRIBER_CONFIG = {
    "model": "nova-3",
    "language": "en",
    "numerals": True,
    "provider": "deepgram"
}

DEFAULT_CLIENT_MESSAGES = [
    "transcript",
    "hang",
    "function-call",
    "speech-update",
    "metadata",
    "transfer-update",
    "conversation-update",
    "function-call-result",
    "model-output",
    "status-update",
    "tool-calls",
    "tool-calls-result",
    "voice-input"
]

DEFAULT_SERVER_MESSAGES = [
    "end-of-call-report",
    "status-update",
    "hang",
    "function-call"
]

DEFAULT_COMPLIANCE_CONFIG = {
    "hipaaEnabled": False,
    "pciEnabled": False
}

def build_voice_config(voice_id: str, **kwargs) -> Dict[str, Any]:
    """
    Build voice configuration with custom overrides.
    
    Args:
        voice_id: The ID of the voice to use
        **kwargs: Optional overrides for default voice settings
        
    Returns:
        Complete voice configuration dictionary
    """
    config = DEFAULT_VOICE_CONFIG.copy()
    config["voiceId"] = voice_id
    config.update(kwargs)
    return config

def build_model_config(sys_prompt: str, **kwargs) -> Dict[str, Any]:
    """
    Build model configuration with system prompt and custom overrides.
    
    Args:
        sys_prompt: The system prompt to use
        **kwargs: Optional overrides for default model settings
        
    Returns:
        Complete model configuration dictionary
    """
    config = DEFAULT_MODEL_CONFIG.copy()
    config["messages"] = [{"role": "system", "content": sys_prompt}]
    config.update(kwargs)
    return config

def build_assistant_payload(
    business_name: str,
    voice_id: str,
    sys_prompt: str,
    first_message: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Build a complete assistant configuration payload.
    
    Args:
        business_name: The name of the business
        voice_id: The ID of the voice to use
        sys_prompt: The system prompt
        first_message: Optional custom first message
        **kwargs: Additional configuration overrides
        
    Returns:
        Complete assistant configuration payload
    """
    logger.debug(f"[CONFIG] build_assistant_payload: Building payload for {business_name}")
    
    payload = {
        "name": f"{business_name} Phone Assistant",
        "voice": build_voice_config(voice_id),
        "model": build_model_config(sys_prompt),
        "firstMessage": first_message or f"Hello, thank you for calling {business_name}, this is Alex, calls may be recorded for quality purposes, how can I help you today?",
        "endCallFunctionEnabled": True,
        "transcriber": DEFAULT_TRANSCRIBER_CONFIG.copy(),
        "clientMessages": DEFAULT_CLIENT_MESSAGES.copy(),
        "serverMessages": DEFAULT_SERVER_MESSAGES.copy(),
        "hipaaEnabled": False,
        "backchannelingEnabled": False,
        "backgroundDenoisingEnabled": False,
        "compliancePlan": DEFAULT_COMPLIANCE_CONFIG.copy()
    }
    
    # Update with any additional configuration
    payload.update(kwargs)
    
    logger.debug(f"[CONFIG] build_assistant_payload: Payload built for {business_name}")
    return payload

def build_update_payload(
    business_name: Optional[str] = None,
    voice_id: Optional[str] = None,
    sys_prompt: Optional[str] = None,
    first_message: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Build a payload for updating an existing assistant.
    Only includes fields that need to be updated.
    
    Args:
        business_name: Optional new business name
        voice_id: Optional new voice ID
        sys_prompt: Optional new system prompt
        first_message: Optional new first message
        **kwargs: Additional fields to update
        
    Returns:
        Update payload containing only the fields to be updated
    """
    logger.debug("[CONFIG] build_update_payload: Building update payload")
    
    payload = {}
    
    if business_name:
        payload["name"] = f"{business_name} Phone Assistant"
    
    if voice_id:
        payload["voice"] = build_voice_config(voice_id)
    
    if sys_prompt:
        payload["model"] = build_model_config(sys_prompt)
    
    if first_message:
        payload["firstMessage"] = first_message
    elif business_name:
        payload["firstMessage"] = f"Hello, thank you for calling {business_name}, this is Alex, calls may be recorded for quality purposes, how can I help you today?"
    
    # Update with any additional fields
    payload.update(kwargs)
    
    logger.debug(f"[CONFIG] build_update_payload: Update payload built with {len(payload)} fields")
    return payload 