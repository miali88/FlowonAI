from fastapi import WebSocket

from flowon_ai.backend.services.pipecat.ws_pipeline import run_bot
import json

from services.db.supabase_ops import supabase_ops
import logging

logger = logging.getLogger(__name__)

async def handle_websocket(websocket: WebSocket) -> None:
    """ TWILIO CALL """
    await websocket.accept()
    start_data = websocket.iter_text()
    await start_data.__anext__()
    call_data = json.loads(await start_data.__anext__())
    print(call_data, flush=True)
    stream_sid = call_data['start']['streamSid']
    print("WebSocket connection accepted")
    await run_bot(websocket, stream_sid) # add condition, only for twilio call

    """ WEB CALL """
    # await websocket.accept()
    # print("WebSocket connection accepted")
    
    # try:
    #     while True:
    #         message = await websocket.receive()
    #         print(f"Received message: {message}")  # Debug print
            
    #         if message['type'] == 'websocket.disconnect':
    #             print("Received disconnect message")
    #             break
    #         elif message['type'] == 'websocket.receive':
    #             if 'text' in message:
    #                 data = json.loads(message['text'])
    #             elif 'bytes' in message:
    #                 data = json.loads(message['bytes'].decode())
    #             else:
    #                 print(f"\n\nReceived unexpected message format: {message}")
    #                 continue

    #             print(f"Processed data: {data}")  # Debug print

    #             if 'start' in data:
    #                 stream_sid = data['start']['streamSid']
    #                 print(f"\n\nStream SID: {stream_sid}", flush=True)
    #                 await run_bot(websocket, stream_sid)
    #             elif 'media' in data:
    #                 # Process audio data
    #                 print(f"\n\nReceived audio data")
    #             else:
    #                 print(f"\n\nReceived unexpected data: {data}")

    # except WebSocketDisconnect:
    #     print("\n\nWebSocket disconnected")
    # finally:
    #     print("\n\nWebSocket connection closed")