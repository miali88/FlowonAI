from dotenv import load_dotenv

from livekit import api 
from livekit.protocol.sip import (CreateSIPInboundTrunkRequest, 
    SIPInboundTrunkInfo, CreateSIPOutboundTrunkRequest, 
    SIPOutboundTrunkInfo, CreateSIPDispatchRuleRequest,
    SIPDispatchRule, SIPDispatchRuleIndividual
)


load_dotenv()

async def create_sip_outbound_trunk(twilio_number: str):
    livekit_api = api.LiveKitAPI()

    trunk = SIPOutboundTrunkInfo(
    name = f"trunk_{twilio_number}",
    numbers = [twilio_number],
    address = "sip.flowon.ai",
    )
  
    request = CreateSIPOutboundTrunkRequest(
        trunk = trunk
    )
    
    trunk = await livekit_api.sip.create_sip_inbound_trunk(request)
    
    await livekit_api.aclose()

async def create_sip_inbound_trunk(twilio_number: str):
    livekit_api = api.LiveKitAPI()

    trunk = SIPInboundTrunkInfo(
    name = f"trunk_{twilio_number}",
    numbers = [twilio_number],
    )
  
    request = CreateSIPInboundTrunkRequest(
        trunk = trunk
    )
    
    trunk = await livekit_api.sip.create_sip_inbound_trunk(request)
    
    await livekit_api.aclose()

async def create_sip_dispatch_rule(twilio_number: str, trunk_id: str):

  livekit_api = api.LiveKitAPI()

  # Create a dispatch rule to place each caller in a separate room
  rule = SIPDispatchRule(
    dispatch_rule_individual = SIPDispatchRuleIndividual(
      room_prefix = f'call-_{twilio_number}_',
      pin = ''
    )   
  )

  request = CreateSIPDispatchRuleRequest(
    rule = rule,
    name = f'rule_{twilio_number}_{trunk_id}',
    trunk_ids = [ 
      trunk_id,
    ],  
    hide_phone_number = False
  )

  try:
    dispatchRule = await livekit_api.sip.create_sip_dispatch_rule(request)
    print(f"Successfully created {dispatchRule}")
  except api.twirp_client.TwirpError as e:
    print(f"{e.code} error: {e.message}")

  await livekit_api.aclose()


""" ENTRY POINT """
async def number_purchased(twilio_number: str):
   await create_sip_outbound_trunk(twilio_number)
   await create_sip_inbound_trunk(twilio_number)

   await create_sip_dispatch_rule(twilio_number, "test")

