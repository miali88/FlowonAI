from __future__ import annotations

import asyncio
import logging
from typing import Optional
from dotenv import load_dotenv
import os 

from livekit import rtc
from livekit.api import MuteRoomTrackRequest

from services.voice.livekit_services import create_livekit_api

load_dotenv()

# Setup logger
logger = logging.getLogger(__name__)

class CallTransferHandler:
    def __init__(self, room: rtc.Room) -> None:
        self._room = room
        # Store subscription states for held participants
        self._held_participants: dict[str, dict[str, bool]] = {}
        self._lk_api = None  # Initialize _lk_api as None
        logger.debug("Initialized CallTransferHandler")
        
    async def __aenter__(self):
        self._lk_api = await create_livekit_api()
        logger.debug("Initialized LiveKit API")
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self._lk_api.aclose()

    async def place_participant_on_hold(self, participant_identity: str) -> None:
        """Places a participant on hold by muting tracks but preserving them.
        Args:
            participant_identity: The identity of the participant to place on hold
            
        Raises:
            ValueError: If participant is not found in the room
        """
        logger.info(f"Placing participant {participant_identity} on hold")
        
        # Get participant from room
        participant = self._room.remote_participants.get(participant_identity)
        if not participant:
            logger.error(f"Participant {participant_identity} not found in room")
            raise ValueError(f"Participant {participant_identity} not found in room")
            
        # Initialize state storage for this participant
        self._held_participants[participant_identity] = {}
        logger.debug(f"Initialized hold state for participant {participant_identity}")
        
        # Instead of removing permissions, we just mute and unsubscribe from tracks
        for publication in participant.track_publications.values():
            # Store the current state
            self._held_participants[participant_identity][publication.sid] = {
                'was_subscribed': publication.subscribed,
                'was_muted': publication.muted
            }
            
            # Mute the track instead of removing permissions
            if publication.kind == rtc.TrackKind.KIND_AUDIO:
                logger.debug(f"Muting track {publication.sid} for held participant")
                await self._lk_api.room.mute_published_track(MuteRoomTrackRequest(
                    room=self._room.name,
                    identity=participant_identity,
                    track_sid=publication.sid,
                    muted=True
                ))
            
            # Optionally unsubscribe but don't remove permissions
            if publication.subscribed:
                publication.set_subscribed(False)
                logger.debug(f"Unsubscribed from track {publication.sid}")

        # Update permissions but keep can_publish=True for telephone participants
        from livekit.api import UpdateParticipantRequest, ParticipantPermission
        
        logger.debug(f"Updating permissions for held participant {participant_identity}")
        await self._lk_api.room.update_participant(UpdateParticipantRequest(
            room=self._room.name,
            identity=participant_identity,
            permission=ParticipantPermission(
                can_subscribe=False,  # They don't need to subscribe while on hold
                can_publish=True,     # Keep this true to preserve their tracks
                can_publish_data=False,
            ),
        ))


        # # Handle participant's published tracks
        # for pub in participant.track_publications.values():
        #     if pub.kind == rtc.TrackKind.KIND_AUDIO:
        #         # Store current subscription state before modifying
        #         self._held_participants[participant_identity][pub.sid] = pub.subscribed
        #         logger.debug(f"Stored subscription state for track {pub.sid}: {pub.subscribed}")
                
        #         # Use LiveKit API to mute the track
        #         if not pub.muted:
        #             logger.debug(f"Muting track {pub.sid} via LiveKit API")
        #             await self._lk_api.room.mute_published_track(MuteRoomTrackRequest(
        #                 room=self._room.name,
        #                 identity=participant_identity,
        #                 track_sid=pub.sid,
        #                 muted=True
        #             ))
                
        #         # Unsubscribe from participant's audio
        #         if pub.subscribed:
        #             logger.debug(f"Unsubscribing from track {pub.sid}")
        #             pub.set_subscribed(False)

        """ TO USE AS A WAY OF MUTING THE AGENT'S VOICE AND GET STT TRANSCRIPTION... PART OF ANALYTICS """
        # Unsubscribe participant from agent's tracks
        # for pub in self._room.local_participant.track_publications.values():
        #     if pub.kind == rtc.TrackKind.KIND_AUDIO:
        #         track_sub = participant.track_publications.get(pub.sid)
        #         if track_sub and track_sub.subscribed:
        #             logger.debug(f"Unsubscribing participant from agent track {pub.sid}")
        #             track_sub.set_subscribed(False)
                    
        logger.info(f"Successfully placed participant {participant_identity} on hold")

    async def restore_participant_from_hold(self, participant_identity: str, second_participant_identity: str) -> None:
        """Restores a participant from hold state"""
        logger.info(f"=== Starting restore process for participant {participant_identity} ===")
        logger.info(f"Current room participants: {list(self._room.remote_participants.keys())}")
        logger.info(f"Current held participants: {list(self._held_participants.keys())}")
        
        print(f"=-=-=-=Second participant identity: {second_participant_identity}")

        # First check if this is the local participant
        if participant_identity == self._room.local_participant.identity:
            participant = self._room.local_participant
            logger.info(f"Participant {participant_identity} identified as local participant (agent)")
        else:
            participant = self._room.remote_participants.get(participant_identity)
            logger.info(f"Looking up {participant_identity} in remote participants - Found: {participant is not None}")
        
        if not participant:
            logger.error(f"Participant lookup failed - Details:")
            logger.error(f"- Requested identity: {participant_identity}")
            logger.error(f"- Local participant identity: {self._room.local_participant.identity}")
            logger.error(f"- Available remote participants: {list(self._room.remote_participants.keys())}")
            raise ValueError(f"Participant {participant_identity} not found in room")
        
        # For local participant (agent), we don't need to check held states
        if participant_identity == self._room.local_participant.identity:
            logger.info("Processing local participant (agent) restore:")
            
            # Modified section to properly connect with second participant
            second_participant = self._room.remote_participants.get(second_participant_identity)
            logger.info(f"Attempting to connect with second participant {second_participant_identity}")
            
            if not second_participant:
                logger.error(f"Failed to find second participant {second_participant_identity}")
                logger.error(f"Available participants: {list(self._room.remote_participants.keys())}")
                raise ValueError(f"Second participant {second_participant_identity} not found in room")
            
            try:
                # Ensure both participants can hear each other
                for pub in self._room.local_participant.track_publications.values():
                    if pub.kind == rtc.TrackKind.KIND_AUDIO:
                        await self._lk_api.room.mute_published_track(MuteRoomTrackRequest(
                            room=self._room.name,
                            identity=self._room.local_participant.identity,
                            track_sid=pub.sid,
                            muted=False
                        ))
                        logger.info(f"✓ Unmuted agent's track {pub.sid}")
                
                # Ensure agent can hear second participant
                for pub in second_participant.track_publications.values():
                    if pub.kind == rtc.TrackKind.KIND_AUDIO:
                        pub.set_subscribed(True)
                        await self._lk_api.room.mute_published_track(MuteRoomTrackRequest(
                            room=self._room.name,
                            identity=second_participant_identity,
                            track_sid=pub.sid,
                            muted=False
                        ))
                        logger.info(f"✓ Successfully enabled participant audio")
                        
            except Exception as e:
                logger.error(f"Connection failed with second participant: {str(e)}")
                raise
                
            logger.info("=== Completed local participant restore ===")
            return

        # Handle remote participants
        held_states = self._held_participants.get(participant_identity)
        if not held_states:
            logger.info(f"No hold state found for {participant_identity} - skipping restore")
            return
        
        logger.info(f"Restoring remote participant {participant_identity}:")
        logger.info(f"- Stored held states: {held_states}")
        
        # Restore participant's track states
        try:
            for pub in participant.track_publications.values():
                if pub.kind == rtc.TrackKind.KIND_AUDIO:
                    logger.info(f"- Processing track {pub.sid}:")
                    if pub.sid in held_states and held_states[pub.sid]:
                        logger.info(f"  - Unmuting track via API")
                        await self._lk_api.room.mute_published_track(MuteRoomTrackRequest(
                            room=self._room.name,
                            identity=participant_identity,
                            track_sid=pub.sid,
                            muted=False
                        ))
                        previous_state = pub.subscribed
                        pub.set_subscribed(True)
                        logger.info(f"  - Subscription changed from {previous_state} to True")
                    else:
                        logger.info(f"  - Track was not previously subscribed, skipping")
        except Exception as e:
            logger.error(f"Failed to restore participant tracks: {str(e)}")
            raise

        # Resubscribe to agent's tracks
        logger.info("Restoring agent tracks to participant:")
        try:
            await self.subscribe_participant_to_agent(participant_identity)
        except Exception as e:
            logger.error(f"Failed to resubscribe agent tracks: {str(e)}")
            raise
            
        # Clean up stored states
        del self._held_participants[participant_identity]
        logger.info(f"=== Completed restore process for {participant_identity} ===")


    async def get_participant(self, participant_identity: str) -> None:
        from livekit.api import RoomParticipantIdentity

        print("getting participant")
        res = await self._lk_api.room.get_participant(RoomParticipantIdentity(
            room=self._room.name,
            identity=participant_identity,
        ))
        print("participant:", res)

    async def re_subscribe_agent(self, participant_identity: str) -> None:
        """Re-subscribes the agent to its own tracks and ensures they're unmuted"""
        logger.info(f"Re-subscribing agent {participant_identity} and unmuting tracks")
        
        # First update permissions
        from livekit.api import UpdateParticipantRequest, ParticipantPermission
        
        print("local participant giving full permissions")
        await self._lk_api.room.update_participant(UpdateParticipantRequest(
            room=self._room.name,
            identity=participant_identity,
            permission=ParticipantPermission(
                can_subscribe=True,
                can_publish=True,
                can_publish_data=True,
            ),
        ))
        
        # Then unmute all agent audio tracks
        for pub in self._room.local_participant.track_publications.values():
            if pub.kind == rtc.TrackKind.KIND_AUDIO:
                await self._lk_api.room.mute_published_track(MuteRoomTrackRequest(
                    room=self._room.name,
                    identity=participant_identity,
                    track_sid=pub.sid,
                    muted=False
                ))
                logger.info(f"Agent track {pub.sid} unmuted")

    async def re_subscribe_participant(self, participant_identity: str) -> None:
        """Re-subscribes a telephone participant and ensures communication"""
        logger.info(f"Re-subscribing telephone participant {participant_identity}")
        
        # First update permissions
        from livekit.api import UpdateParticipantRequest, ParticipantPermission
        
        # Get the remote participant
        target_participant = self._room.remote_participants.get(participant_identity)
        print(f"Available participants in room: {list(self._room.remote_participants.keys())}")
        logger.debug(f"Available participants in room: {list(self._room.remote_participants.keys())}")
        
        if target_participant is None:
            logger.error(f"Could not find participant {participant_identity}")
            print(f"❌ ERROR: Participant {participant_identity} not found in room")
            return

        # Check if this is a SIP participant (telephone)
        logger.info(f"Participant kind: {target_participant.kind}")
        print(f"Checking participant type - Kind: {target_participant.kind}")
        
        if target_participant.kind != rtc.ParticipantKind.PARTICIPANT_KIND_SIP:
            logger.error(f"Participant {participant_identity} is not a telephone participant")
            print(f"❌ ERROR: Not a telephone participant (kind: {target_participant.kind})")
            return

        # Update permissions first
        try:
            logger.info("Updating participant permissions...")
            print("📝 Updating participant permissions...")
            await self._lk_api.room.update_participant(UpdateParticipantRequest(
                room=self._room.name,
                identity=participant_identity,
                permission=ParticipantPermission(
                    can_subscribe=True,
                    can_publish=True,
                    can_publish_data=True,
                ),
            ))
            logger.info("✓ Permissions updated successfully")
            print("✓ Permissions updated successfully")
        except Exception as e:
            logger.error(f"Failed to update permissions: {str(e)}")
            print(f"❌ ERROR updating permissions: {str(e)}")
            raise

        # Subscribe to all tracks
        logger.info(f"Processing {len(target_participant.track_publications)} tracks")
        print(f"🎵 Processing {len(target_participant.track_publications)} tracks")
        
        for publication in target_participant.track_publications.values():
            logger.debug(f"Processing track {publication.sid} (kind: {publication.kind})")
            print(f"- Processing track {publication.sid} (kind: {publication.kind})")
            
            # Handle audio tracks
            if publication.kind == rtc.TrackKind.KIND_AUDIO:
                try:
                    logger.info(f"Unmuting track {publication.sid}")
                    print(f"  🔊 Unmuting track {publication.sid}")
                    await self._lk_api.room.mute_published_track(MuteRoomTrackRequest(
                        room=self._room.name,
                        identity=participant_identity,
                        track_sid=publication.sid,
                        muted=False
                    ))
                    logger.info(f"✓ Successfully unmuted track {publication.sid}")
                    print(f"  ✓ Track unmuted successfully")
                except Exception as e:
                    logger.error(f"Failed to unmute track {publication.sid}: {str(e)}")
                    print(f"  ❌ Failed to unmute track: {str(e)}")
                    raise

            # Handle subscription
            try:
                prev_state = publication.subscribed
                if not publication.subscribed:
                    publication.set_subscribed(True)
                    logger.info(f"Track {publication.sid} subscription changed: {prev_state} -> True")
                    print(f"  📡 Track subscription updated: {prev_state} -> True")
            except Exception as e:
                logger.error(f"Failed to subscribe to track {publication.sid}: {str(e)}")
                print(f"  ❌ Failed to subscribe to track: {str(e)}")
                raise

        logger.info("Waiting for changes to take effect...")
        print("⏳ Waiting for changes to take effect...")
        await asyncio.sleep(1)
        
        logger.info(f"=== Completed re_subscribe_participant for {participant_identity} ===")
        print(f"✅ Re-subscription process completed for {participant_identity}")