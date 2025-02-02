import asyncio
import os
from dotenv import load_dotenv
from livekit import api 
from livekit.protocol.sip import CreateSIPInboundTrunkRequest, SIPInboundTrunkInfo

load_dotenv()

async def main(new_twilio_number: str):
    livekit_api = api.LiveKitAPI()

    trunk = SIPInboundTrunkInfo(
    name = "My Twilio trunk",
    numbers = ['+15105550100'],
    )
  
    request = CreateSIPInboundTrunkRequest(
        trunk = trunk
    )
    
    trunk = await livekit_api.sip.create_sip_inbound_trunk(request)
    
    await livekit_api.aclose()

if __name__ == "__main__":
    new_twilio_number = "+13614281772"
    asyncio.run(main(new_twilio_number))
