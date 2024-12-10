from livekit.api import UpdateParticipantRequest, ParticipantPermission

# Promotes an audience member to a speaker
await lkapi.room.update_participant(UpdateParticipantRequest(
  room=room_name,
  identity=identity,
  permission=ParticipantPermission(
    can_subscribe=True,
    can_publish=True,
    can_publish_data=True,
  ),
))