from typing import Annotated, Optional, Literal, Union, Dict, List
import json
import aiohttp, os, logging, asyncio
from dotenv import load_dotenv
from functools import partial

from livekit.agents import llm, JobContext

from services.chat.chat import similarity_search
from services.cache import get_agent_metadata

# Update logger configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

API_BASE_URL = os.getenv("DOMAIN")



@llm.ai_callable(
    name="question_and_answer",
    description="Extract user's question and perform information retrieval search to provide relevant answers",
    auto_retry=True
)
async def question_and_answer(
    question: Annotated[
        str,
        llm.TypeInfo(
            description="The user's question that needs to be answered"
        )
    ]
) -> str:
    """
    Takes the user's question and performs information retrieval search based on the user's question.
    Returns relevant information found in the knowledge base.
    """
    print("\n\n Processing Q&A tool")
    try:
        # Get the room_name from the current AgentFunctions instance
        room_name = AgentFunctions.current_room_name
        
        logger.info(f"Processing Q&A for question: {question}")
        print(f"Processing Q&A for question: {question}")

        agent_id = room_name.split('_')[1]  # Extract agent_id from room name
        agent_metadata: Dict = await get_agent_metadata(agent_id)

        user_id: str = agent_metadata['userId']
        data_source: str = agent_metadata.get('dataSource', None)

        if data_source != "all":
            data_source: Dict = json.loads(data_source)
            data_source: Dict = {
                "web": [item['title'] for item in data_source if item['data_type'] == 'web'],
                "text_files": [item['id'] for item in data_source if item['data_type'] != 'web']
            }
            results = await similarity_search(question, data_source=data_source, user_id=user_id)
        else:
            data_source = {"web": ["all"], "text_files": ["all"]}
            results = await similarity_search(question, data_source=data_source, user_id=user_id)

        rag_prompt = f"""
        ## User Query: {question}
        ## Found matching products/services: {results}
        """

        return f"Found matching products/services: {results}"

    except Exception as e:
        logger.error(f"Error in question_and_answer: {str(e)}", exc_info=True)
        return "I apologize, but I encountered an error while searching for an answer to your question."

class AgentFunctions(llm.FunctionContext):
    current_room_name = None  # Class variable to store current room_name
    
    def __init__(self, job_ctx):
        super().__init__()
        self.job_ctx = job_ctx
        self.room_name = job_ctx.room.name
        AgentFunctions.current_room_name = self.room_name  # Store room_name

    async def initialize_functions(self):
        print("Initializing functions for agent")
        room_name = self.job_ctx.room.name
        agent_id = room_name.split('_')[1]
        agent_metadata = await get_agent_metadata(agent_id)
        features = agent_metadata.get('features', [])
        
        # Register Q&A function if feature is enabled
        if 'qa' in features:
            self._register_ai_function(question_and_answer)
            print(f"Registered Q&A function")
            logger.info(f"Registered Q&A function")

async def trigger_show_chat_input(room_name: str, job_id: str, participant_identity: str):
    logger.info(f"Triggering chat input for room={room_name}, job_id={job_id}")
    async with aiohttp.ClientSession() as session:
        try:
            # First, trigger the chat input form
            logger.debug("Sending POST request to trigger_show_chat_input endpoint")
            await session.post(f'{API_BASE_URL}/conversation/trigger_show_chat_input', 
                             json={'room_name': room_name, 'job_id': job_id, 'participant_identity': participant_identity})
            
            # Wait 2 seconds before starting to poll
            await asyncio.sleep(2)

            # Poll for the chat message with a timeout
            max_attempts = 45  # 45 seconds total (1 second intervals)
            attempt = 0
            
            while attempt < max_attempts:
                logger.debug(f"Polling for chat message, attempt {attempt + 1}")
                response = await session.get(
                    f'{API_BASE_URL}/conversation/chat_message',
                    params={'participant_identity': participant_identity}
                )
                response_data = await response.json()
                
                if response_data and len(response_data) > 0:
                    chat_message = {
                        'full_name': response_data[0].get('full_name'),
                        'email': response_data[0].get('email'),
                        'contact_number': response_data[0].get('contact_number')
                    }
                    #logger.info(f"Successfully received chat message for {chat_message.get('full_name')}")
                    await send_lead_notification(chat_message)
                    return chat_message
                
                await asyncio.sleep(1)
                attempt += 1
            
            logger.warning("Timeout waiting for chat message")
            return None
            
        except Exception as e:
            logger.error(f"Error in trigger_show_chat_input: {str(e)}", 
                        extra={'room_name': room_name, 'job_id': job_id}, 
                        exc_info=True)
            raise

async def send_lead_notification(chat_message: dict):
    """ nylas email send here """
    pass


