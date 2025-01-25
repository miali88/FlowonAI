import asyncio

from livekit import api 
from livekit.protocol.sip import CreateSIPInboundTrunkRequest, SIPInboundTrunkInfo

async def main():
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


asyncio.run(main())