import os
from dotenv import load_dotenv
from openai import OpenAI
import logging

from app.core.config import settings

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

load_dotenv()

# Best practice: store your credentials in environment variables
wcd_url = settings.WEAVIATE_URL
wcd_api_key = settings.WEAVIATE_API_KEY
openai_api_key = settings.OPENAI_API_KEY

lm = OpenAI(api_key=openai_api_key)

try:
    """ instantiate weviate client """



        p_company_name = ""
        cx_sys_prompt = f"""
                # System Prompt
                You are an AI assistant for {p_company_name}, designed to provide accurate and relevant information based solely on the company's knowledge base. Your primary function is to interpret user queries and generate responses grounded in the provided context.

                ## Core Principles:
                1. Accuracy: Only use information explicitly stated in the provided context.
                2. Relevance: Tailor your responses directly to the user's query.
                3. Transparency: Clearly state when information is insufficient or missing.
                4. Conciseness: Provide clear, direct answers without unnecessary elaboration.

                ## Operational Guidelines:
                - Analyze the given context thoroughly before formulating responses.
                - Do not introduce external information or make assumptions beyond the provided context.
                - If asked about topics outside the given context, politely explain that you can only discuss information within the company's knowledge base.
                - Use a professional and helpful tone, reflecting the company's values and communication style.
                - When appropriate, cite specific parts of the context to support your answers.
                """
        
        retriever_prompt = f""" 
                ## Context from knowledge base:
                {ir_results}

                User query: "{query}"

                ##Instructions:
                1. Carefully read the provided context and the human's query.
                2. Formulate a response that directly answers the query using only the information given in the context.
                3. If the context doesn't contain enough information to fully answer the query, state this clearly and explain what specific information is missing.
                4. Do not introduce any information or opinions not present in the provided context.
                5. If appropriate, cite specific parts of the context to support your answer.

                ## Your response:
                """
        
        def agent_retriever(system_prompt, user_prompt):
            print('agent_retriever...')
            try:
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": 'user', "content": user_prompt},
                ]

                response = lm.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages
                )

                logging.info("Successfully retrieved response from OpenAI")
                content = response.choices[0].message.content
                print('response...', content)
                logging.info(f"OpenAI response content: {content}")
                return {"answer": content}  # Return a dictionary with 'answer' key

            except Exception as e:
                logging.error(f"Error in agent_retriever: {str(e)}", exc_info=True)
                return {"error": str(e)}  # Return error information instead of raising

except Exception as e:
    logging.error(f"An error occurred: {str(e)}")
    raise