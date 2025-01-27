from composio import ComposioToolSet, App
import os 
from dotenv import load_dotenv
load_dotenv()

toolset = ComposioToolSet()

trigger_schema = toolset.get_trigger("OUTLOOK_OUTLOOK_SENT_MESSAGE_TRIGGER")

entity = toolset.get_entity()
response = entity.enable_trigger(
    app=App.OUTLOOK,
    trigger_name="OUTLOOK_OUTLOOK_SENT_MESSAGE_TRIGGER",
    config={"owner": "composiohq", "repo": "composio"},
)
print(response)

listener = toolset.create_trigger_listener()

@listener.callback(filters={"trigger_id": response["triggerId"]})
def callback_function(event):
    print(event)

print("Listening")
listener.wait_forever()

