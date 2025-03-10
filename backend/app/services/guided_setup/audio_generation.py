import logging
from typing import Dict, Any, Optional

from app.clients.elevenlabs_client import elevenlabs_client

async def generate_greeting_preview(
    user_id: str,
    business_name: str,
    business_description: str,
    business_website: Optional[str] = None,
    language: str = "en"
) -> Dict[str, Any]:
    """
    Generate a greeting audio preview for the onboarding process.
    Uses minimal business information to create a sample greeting.
    
    Args:
        user_id: The ID of the user
        business_name: Name of the business
        business_description: Brief description of the business
        business_website: Optional website URL
        language: Language code for the greeting (ISO 639-1, e.g., "en", "es", "fr")
        
    Returns:
        Dictionary with success status and audio binary data or error
    """
    try:
        logging.info(f"Generating greeting preview for user {user_id} with business: {business_name}, language: {language}")
        
        # Use a default voice for the preview
        default_voice_id = 'Ize3YDdGqJYYKQSDLORJ'
        
        # Create a sample greeting message based on business info and language
        greeting_text = ""
        
        # Generate greeting text based on language
        if language == "en":  # English
            greeting_text = f"Hello, thank you for calling {business_name}. This is Jess. How can I help you today?"
        elif language == "es":  # Spanish
            greeting_text = f"Hola, gracias por llamar a {business_name}. Soy Jess. ¿Cómo puedo ayudarle hoy?"
        elif language == "fr":  # French
            greeting_text = f"Bonjour, merci d'avoir appelé {business_name}. Je suis Jess. Comment puis-je vous aider aujourd'hui?"
        elif language == "de":  # German
            greeting_text = f"Hallo, vielen Dank für Ihren Anruf bei {business_name}. Hier ist Jess. Wie kann ich Ihnen heute helfen?"
        elif language == "pt":  # Portuguese
            greeting_text = f"Olá, obrigado por ligar para {business_name}. Sou Jess. Como posso ajudá-lo hoje?"
        elif language == "ar":  # Arabic
            greeting_text = f"مرحبًا، شكرًا لاتصالك بـ {business_name}. أنا جيس. كيف يمكنني مساعدتك اليوم؟"
        else:  # Default to English for other languages
            greeting_text = f"Hello, thank you for calling {business_name}. This is Jess. How can I help you today?"
        
        # Generate audio using ElevenLabs client
        try:
            # Generate the audio using our client and get binary data
            audio_data = elevenlabs_client.generate_audio(
                text=greeting_text,
                voice_id=default_voice_id,
                return_bytes=True
            )
            logging.info(f"Successfully generated audio for greeting preview")
        except Exception as audio_error:
            logging.error(f"Error generating audio: {str(audio_error)}")
            return {
                "success": False,
                "error": f"Failed to generate audio: {str(audio_error)}"
            }
        
        logging.info(f"Generated greeting preview for {business_name} in {language}")
        
        # Return both the audio data and the text
        return {
            "success": True,
            "audio_data": audio_data,  # Return the binary audio data
            "text": greeting_text
        }
    except Exception as e:
        logging.error(f"Error generating greeting preview: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to generate greeting audio: {str(e)}"
        }

async def generate_message_preview(
    user_id: str,
    business_name: str,
    language: str = "en"
) -> Dict[str, Any]:
    """
    Generate a message-taking audio preview for the onboarding process.
    
    Args:
        user_id: The ID of the user
        business_name: Name of the business
        language: Language code for the message (ISO 639-1, e.g., "en", "es", "fr")
        
    Returns:
        Dictionary with success status and audio binary data or error
    """
    try:
        logging.info(f"Generating message preview for user {user_id} with business: {business_name}, language: {language}")
        
        # Use a default voice for the preview
        default_voice_id = 'Ize3YDdGqJYYKQSDLORJ'
        
        # Create a sample message-taking text based on language
        message_text = ""
        
        # Generate message text based on language
        if language == "en":  # English
            message_text = (
                f"I'd be happy to take a message for {business_name}. "
                "Could I please get your name and phone number? "
                "Also, please let me know what your message is about, "
                "and I'll make sure it gets to the right person."
            )
        elif language == "es":  # Spanish
            message_text = (
                f"Me gustaría tomar un mensaje para {business_name}. "
                "¿Podría darme su nombre y número de teléfono? "
                "También, por favor, dígame de qué se trata su mensaje, "
                "y me aseguraré de que llegue a la persona adecuada."
            )
        elif language == "fr":  # French
            message_text = (
                f"Je serais heureux de prendre un message pour {business_name}. "
                "Puis-je avoir votre nom et votre numéro de téléphone? "
                "Veuillez également me dire de quoi parle votre message, "
                "et je m'assurerai qu'il parvienne à la bonne personne."
            )
        elif language == "de":  # German
            message_text = (
                f"Ich nehme gerne eine Nachricht für {business_name} entgegen. "
                "Darf ich bitte Ihren Namen und Ihre Telefonnummer haben? "
                "Teilen Sie mir bitte auch mit, worum es in Ihrer Nachricht geht, "
                "und ich werde sicherstellen, dass sie an die richtige Person weitergeleitet wird."
            )
        elif language == "pt":  # Portuguese
            message_text = (
                f"Terei prazer em anotar uma mensagem para {business_name}. "
                "Poderia me dar seu nome e número de telefone? "
                "Além disso, diga-me do que se trata sua mensagem, "
                "e eu me certificarei de que chegue à pessoa certa."
            )
        elif language == "ar":  # Arabic
            message_text = (
                f"يسعدني أن آخذ رسالة لـ {business_name}. "
                "هل يمكنني الحصول على اسمك ورقم هاتفك؟ "
                "أيضًا، يرجى إخباري بموضوع رسالتك، "
                "وسأتأكد من وصولها إلى الشخص المناسب."
            )
        else:  # Default to English for other languages
            message_text = (
                f"I'd be happy to take a message for {business_name}. "
                "Could I please get your name and phone number? "
                "Also, please let me know what your message is about, "
                "and I'll make sure it gets to the right person."
            )
        
        # Generate audio using ElevenLabs client
        try:
            # Generate the audio using our client and get binary data
            audio_data = elevenlabs_client.generate_audio(
                text=message_text,
                voice_id=default_voice_id,
                return_bytes=True
            )
            logging.info(f"Successfully generated audio for message preview")
        except Exception as audio_error:
            logging.error(f"Error generating audio: {str(audio_error)}")
            return {
                "success": False,
                "error": f"Failed to generate audio: {str(audio_error)}"
            }
        
        logging.info(f"Generated message preview for {business_name} in {language}")
        
        # Return both the audio data and the text
        return {
            "success": True,
            "audio_data": audio_data,  # Return the binary audio data
            "text": message_text
        }
    except Exception as e:
        logging.error(f"Error generating message preview: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to generate message audio: {str(e)}"
        } 