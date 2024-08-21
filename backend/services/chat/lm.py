# pyright: reportGeneralTypeIssues=false
# pylint: disable=E1101

import weaviate
from weaviate.classes.init import Auth
import weaviate.classes as wvc
import os
from dotenv import load_dotenv
from termcolor import colored  
from openai import OpenAI

load_dotenv()

# Best practice: store your credentials in environment variables
wcd_url = os.getenv("WEAVIATE_URL")
wcd_api_key = os.getenv("WEAVIATE_API_KEY")
openai_api_key = os.getenv("OPENAI_API_KEY")

lm = OpenAI(api_key=openai_api_key)

""" instantiate weviate client """
with weaviate.connect_to_weaviate_cloud(
    cluster_url=wcd_url,  # Replace with your Weaviate Cloud URL
    auth_credentials=Auth.api_key(wcd_api_key),  # Replace with your Weaviate Cloud key
    headers={
        'X-OpenAI-Api-key': openai_api_key  # Replace with appropriate header key/value pair for the required API
    }
) as client:  # Use this context manager to ensure the connection is closed
    print(client.is_ready())

    """ Retrieve the context from KB """
    weaviate_coll = "EcommerceFAQ"
    ecommerce_faq = client.collections.get(weaviate_coll)

    query = "i just received my Macbook M1 2021 today, i ordered it last week, but noticed the edges have a few chips, I would like to request a refund for this." #user input 
    ir_results = ecommerce_faq.query.near_text(
        query=query,
        limit=5,
        return_metadata=wvc.query.MetadataQuery(certainty=True), #certainaty not the best

    )

    for obj in ir_results.objects:
        print(f"Question: {obj.properties['question']}")
        print(f"Answer: {obj.properties['answer']}")
        #print(f"Certainty: {obj.metadata.certainty}")
        print("---")

    p_company_name = "E Commie"
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
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": 'user', "content": user_prompt},
        ]

        response = lm.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages
        )

        return response.choices[0].message.content