from dotenv import load_dotenv
import logging

from livekit import api 
from livekit.protocol.sip import (CreateSIPInboundTrunkRequest, 
    SIPInboundTrunkInfo, CreateSIPOutboundTrunkRequest, 
    SIPOutboundTrunkInfo, CreateSIPDispatchRuleRequest,
    SIPDispatchRule, SIPDispatchRuleIndividual
)

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Set up logger
logger = logging.getLogger(__name__)
# Set logger level to ensure all messages are processed
logger.setLevel(logging.DEBUG)

async def create_sip_outbound_trunk(twilio_number: str):
    """
    Create a LiveKit SIP outbound trunk for a Twilio number
    
    Args:
        twilio_number: The Twilio phone number in E.164 format
        
    Returns:
        The created trunk object with the trunk ID
    """
    logger.info(f"Creating SIP outbound trunk for number: {twilio_number}")
    livekit_api = api.LiveKitAPI()

    trunk = SIPOutboundTrunkInfo(
        name = f"trunk_{twilio_number}",
        numbers = [twilio_number],
        address = "sip.flowon.ai",
    )
    logger.debug(f"Configured outbound trunk info: {trunk}")
  
    request = CreateSIPOutboundTrunkRequest(
        trunk = trunk
    )
    logger.debug(f"Prepared outbound trunk request: {request}")
    
    created_trunk = None
    try:
        created_trunk = await livekit_api.sip.create_sip_outbound_trunk(request)
        logger.info(f"Successfully created outbound trunk: {created_trunk}")
        return created_trunk
    except api.twirp_client.TwirpError as e:
        logger.error(f"Failed to create outbound trunk: {e.code} error: {e.message}")
        raise
    finally:
        await livekit_api.aclose()
        logger.debug("Closed LiveKit API connection")

async def create_sip_inbound_trunk(twilio_number: str):
    """
    Create a LiveKit SIP inbound trunk for a Twilio number
    
    Args:
        twilio_number: The Twilio phone number in E.164 format
        
    Returns:
        The created trunk object with the trunk ID
    """
    logger.info(f"Creating SIP inbound trunk for number: {twilio_number}")
    livekit_api = api.LiveKitAPI()

    trunk = SIPInboundTrunkInfo(
        name = f"trunk_{twilio_number}",
        numbers = [twilio_number],
    )
    logger.debug(f"Configured inbound trunk info: {trunk}")
  
    request = CreateSIPInboundTrunkRequest(
        trunk = trunk
    )
    logger.debug(f"Prepared inbound trunk request: {request}")
    
    created_trunk = None
    try:
        created_trunk = await livekit_api.sip.create_sip_inbound_trunk(request)
        logger.info(f"Successfully created inbound trunk: {created_trunk}")
        return created_trunk
    except api.twirp_client.TwirpError as e:
        logger.error(f"Failed to create inbound trunk: {e.code} error: {e.message}")
        raise
    finally:
        await livekit_api.aclose()
        logger.debug("Closed LiveKit API connection")

async def create_sip_dispatch_rule(twilio_number: str, trunk_id: str):
    logger.info(f"Creating SIP dispatch rule for number: {twilio_number}, trunk_id: {trunk_id}")
    livekit_api = api.LiveKitAPI()

    # Create a dispatch rule to place each caller in a separate room
    rule = SIPDispatchRule(
        dispatch_rule_individual = SIPDispatchRuleIndividual(
            room_prefix = f'call-_{twilio_number}_',
            pin = ''
        )   
    )
    logger.debug(f"Configured dispatch rule: {rule}")

    request = CreateSIPDispatchRuleRequest(
        rule = rule,
        name = f'rule_{twilio_number}_{trunk_id}',
        trunk_ids = [ 
            trunk_id,
        ],  
        hide_phone_number = False
    )
    logger.debug(f"Prepared dispatch rule request: {request}")

    try:
        dispatchRule = await livekit_api.sip.create_sip_dispatch_rule(request)
        logger.info(f"Successfully created dispatch rule: {dispatchRule}")
    except api.twirp_client.TwirpError as e:
        logger.error(f"Failed to create dispatch rule: {e.code} error: {e.message}")
        raise
    finally:
        await livekit_api.aclose()
        logger.debug("Closed LiveKit API connection")

""" ENTRY POINT """
async def number_purchased(twilio_number: str):
    """
    Set up a newly purchased Twilio number with LiveKit SIP
    
    Args:
        twilio_number: The purchased phone number in E.164 format
        
    Returns:
        None
        
    Raises:
        Exception: If setup completely fails
    """
    logger.info(f"=== Processing newly purchased number: {twilio_number} ===")
    success = False
    trunk_id = None
    
    try:
        # Step 1: Create outbound trunk
        try:
            logger.info("Step 1: Creating outbound trunk")
            await create_sip_outbound_trunk(twilio_number)
            logger.info("✅ Outbound trunk created successfully")
        except Exception as e:
            logger.error(f"❌ Failed to create outbound trunk: {str(e)}")
            # Continue to next step even if this fails
        
        # Step 2: Create inbound trunk (this is the critical one for receiving calls)
        try:
            logger.info("Step 2: Creating inbound trunk")
            inbound_result = await create_sip_inbound_trunk(twilio_number)
            trunk_id = getattr(inbound_result, 'id', 'default_trunk_id')
            logger.info(f"✅ Inbound trunk created successfully with ID: {trunk_id}")
            success = True  # Mark as successful if we at least got the inbound trunk
        except Exception as e:
            logger.error(f"❌ Failed to create inbound trunk: {str(e)}")
            # This is critical, but we'll still try the dispatch rule if trunk_id is available
        
        # Step 3: Create dispatch rule if we have a trunk ID
        if trunk_id:
            try:
                logger.info("Step 3: Creating dispatch rule")
                await create_sip_dispatch_rule(twilio_number, trunk_id)
                logger.info("✅ Dispatch rule created successfully")
            except Exception as e:
                logger.error(f"❌ Failed to create dispatch rule: {str(e)}")
                # Not critical if this fails
        
        if success:
            logger.info(f"=== Successfully completed core setup for number: {twilio_number} ===")
        else:
            logger.warning(f"=== Partially completed setup for number: {twilio_number}, manual intervention may be required ===")
            
        return success
            
    except Exception as e:
        logger.error(f"Failed to complete setup for number {twilio_number}: {str(e)}")
        raise

if __name__ == "__main__":
    import asyncio
    new_number = "+19895753964"
    asyncio.run(number_purchased(new_number))