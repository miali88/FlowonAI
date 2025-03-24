"""
The below is an example of a curl request to initiate an outbound call to a given customer number. 

In production, the customer number and the assistant ID along with certain parameters of the assistant ID will be dynamic. 

curl -X POST https://api.vapi.ai/call \
     -H "Authorization: Bearer 89487bb9-da21-49a1-9550-6fed78158f84" \
     -H "Content-Type: application/json" \
     -d '{
  "assistantId": "9a950993-8e6a-459e-bb56-0f931ed2f3a5",
  "phoneNumberId": "af98b91b-9964-4ba4-84b4-1ac567470af4",
  "customer": {
    "number": "+1 361 428 1772"
  }
}'

"""