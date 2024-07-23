from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Dial, Stream, Connect

from app.core.config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN


client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# Lifespan contextmanager function, will run every time the app is started and stopped. to change to once call ends. 
def cleanup():
    print("Cleaning up before exit...")
    ## Ensuring all prior calls are ended
    calls = client.calls.list(status='in-progress')

    # Print and end each ongoing call
    if calls:
        for call in calls:
            print(f"Ending call SID: {call.sid}, From: {call.from_formatted}, To: {call.to}, Duration: {call.duration}, Status: {call.status}")
            call = client.calls(call.sid).update(status='completed')
            print(f"Ended call SID: {call.sid}")
    else:
        print('No calls in progress')