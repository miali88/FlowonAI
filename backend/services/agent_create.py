import uuid
import requests
from urllib.parse import urlparse
from services.knowledge_base.web_scrape import map_url, scrape_url
from services.chat.chat import llm_response
from typing import List, Dict
import openai
from humanloop import Humanloop
from dotenv import load_dotenv
import os

load_dotenv()

client = Humanloop(
    api_key=os.getenv("HUMANLOOP_API_KEY"),
)

async def create_opening_line(scraped_content: str) -> str:
    # Assuming you have OpenAI API setup
    user_prompt = f"""
    # Instructions:
    Based on this website content, create an engaging opening line for a customer service agent, like  <example_opening_line>"Welcome to WeCreate👋! Looking to boost your brand's online presence? What's your biggest goal right now?</example_opening_line>
    IMPORTANT: You must only respond with the opening line, no other text. No speech marks either, only the text.
    # Website content:
    {scraped_content[:1000]}"""
    
    system_prompt = "You are an expert at creating opening lines for customer service agents. You are given a website content and you are tasked with creating a friendly opening line for a customer service agent."
    
    response = await llm_response(system_prompt, user_prompt)
    return response

async def create_agent_instructions(scraped_content: str) -> str:
    user_prompt = f"""
    # Instructions:
    Based on this website content, create a short sentence that begins with the name of the Company, and a short description saying what it does, like "WeCreate, a branding & digital marketing agency based Singapore, Hong Kong, and the UK."
    IMPORTANT: You must only respond with the instructions, no other text.
    # Website content:
    {scraped_content[:1000]}
    """
    
    system_prompt = "You are an expert at creating instructions for customer service agents. You are given a website content and you are tasked with creating instructions for a customer service agent."
    
    response = await llm_response(system_prompt, user_prompt)
    return response

async def create_agents_from_urls(url: str) -> str:
    try:
        print("url:", url)
        # Get domain name for agent name
        domain = urlparse(url).netloc
        agent_name = domain.replace("www.", "")
        
        # Map and scrape the URL
        mapped_url = await map_url(url)
        scraped_content = await scrape_url(mapped_url[:100], user_id="user_2mmXezcGmjZCf88gT2v2waCBsXv")
        
        web_content = ""
        for i in scraped_content:
            web_content += i['content']
        web_content = web_content[:10000]

        # Generate opening line and company details
        opening_line = await create_opening_line(web_content)
        company_details = await create_agent_instructions(web_content)

        humanloop_prompt = client.prompts.get(
            id="pr_BiPy5GsclDI8uAzmHR8S7",
        )
        agent_instructions = humanloop_prompt.template[0]['content'].replace("{{company_details}}", company_details)

        # Create payload
        payload = {
            "agentName": agent_name,
            "agentPurpose": "text-chatbot-agent",
            "dataSource": [{
                "id": str(uuid.uuid4()),
                "title": url,
                "data_type": "web"
            }],
            "openingLine": opening_line,
            "language": "en-GB",
            "voice": "Alex K",
            "voiceProvider": "cartesia",
            "instructions": agent_instructions,
            "features": {
                "lead_gen": {"enabled": True},
                "callTransfer": {"enabled": False},
                "notifyOnInterest": {"enabled": False},
                "appointmentBooking": {"enabled": False}
            },
            "form_fields": {
                "fields": [
                    {"type": "text", "label": "Full name"},
                    {"type": "email", "label": "Email address"}
                ]
            },
            "company_name": agent_name
        }

        # POST request
        response = requests.post(
            "https://flowon.ai/api/v1/livekit/new_agent",
            json=payload,
            headers={"x-user-id": "user_2mmXezcGmjZCf88gT2v2waCBsXv"}
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to create agent: {response.text}")

        response_json = response.json()
        agent_id = response_json['data'][0]['id']
        return agent_id

    except Exception as e:
        print(f"Error creating agent: {str(e)}")
        raise e


