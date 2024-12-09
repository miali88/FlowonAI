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
        """Places a participant on hold by muting and unsubscribing from tracks.
        
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
        
        # Handle participant's published tracks
        for pub in participant.track_publications.values():
            if pub.kind == rtc.TrackKind.KIND_AUDIO:
                # Store current subscription state before modifying
                self._held_participants[participant_identity][pub.sid] = pub.subscribed
                logger.debug(f"Stored subscription state for track {pub.sid}: {pub.subscribed}")
                
                # Use LiveKit API to mute the track
                if not pub.muted:
                    logger.debug(f"Muting track {pub.sid} via LiveKit API")
                    await self._lk_api.room.mute_published_track(MuteRoomTrackRequest(
                        room=self._room.name,
                        identity=participant_identity,
                        track_sid=pub.sid,
                        muted=True
                    ))
                
                # Unsubscribe from participant's audio
                if pub.subscribed:
                    logger.debug(f"Unsubscribing from track {pub.sid}")
                    pub.set_subscribed(False)

        """ TO USE AS A WAY OF MUTING THE AGENT'S VOICE AND GET STT TRANSCRIPTION... PART OF ANALYTICS """
        # # Unsubscribe participant from agent's tracks
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


    async def subscribe_participant_to_agent(self, participant_identity: str) -> None:
        """Ensures a participant is subscribed to the agent's audio tracks."""
        logger.info(f"Subscribing participant {participant_identity} to agent tracks")
        
        participant = self._room.remote_participants.get(participant_identity)
        if not participant:
            logger.error(f"Participant {participant_identity} not found in room")
            raise ValueError(f"Participant {participant_identity} not found in room")
        
        # Subscribe to agent's tracks
        for pub in self._room.local_participant.track_publications.values():
            if pub.kind == rtc.TrackKind.KIND_AUDIO:
                track_sub = participant.track_publications.get(pub.sid)
                if track_sub:
                    previous_state = track_sub.subscribed
                    track_sub.set_subscribed(True)
                    logger.info(f"- Agent track {pub.sid}: subscription changed from {previous_state} to True")