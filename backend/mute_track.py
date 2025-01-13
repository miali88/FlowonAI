from __future__ import annotations
import logging
from typing import Dict

from livekit import rtc
from livekit.api import (
    MuteRoomTrackRequest,
    UpdateParticipantRequest,
    ParticipantPermission,
)

from services.voice.livekit_services import create_livekit_api

# Setup logger
logger = logging.getLogger(__name__)


class CallTransferHandler:
    def __init__(self, room: rtc.Room) -> None:
        self._room = room
        # Store subscription states for held participants
        self._held_participants: Dict[str, dict] = {}
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
                await self._lk_api.room.mute_published_track(
                    MuteRoomTrackRequest(
                        room=self._room.name,
                        identity=participant_identity,
                        track_sid=publication.sid,
                        muted=True
                    )
                )

            # Optionally unsubscribe but don't remove permissions
            if publication.subscribed:
                publication.set_subscribed(False)
                logger.debug(f"Unsubscribed from track {publication.sid}")

        # Update permissions but keep can_publish=True for telephone participants
        logger.debug(
            f"Updating permissions for held participant {participant_identity}"
        )
        await self._lk_api.room.update_participant(
            UpdateParticipantRequest(
                room=self._room.name,
                identity=participant_identity,
                permission=ParticipantPermission(
                    can_subscribe=False,  # They don't need to subscribe while on hold
                    can_publish=True,     # Keep this true to preserve their tracks
                    can_publish_data=False,
                ),
            )
        )

        logger.info(f"Successfully placed participant {participant_identity} on hold")

    async def restore_participant_from_hold(
        self,
        participant_identity: str,
        second_participant_identity: str
    ) -> None:
        """Restores a participant from hold state.

        Args:
            participant_identity: The identity of the participant to restore
            second_participant_identity: The identity of the second participant
        """
        logger.info(
            "=== Starting restore process for participant "
            f"{participant_identity} ==="
        )
        logger.info(
            f"Current room participants: "
            f"{list(self._room.remote_participants.keys())}"
        )
        logger.info(
            f"Current held participants: "
            f"{list(self._held_participants.keys())}"
        )

        # First check if this is the local participant
        if participant_identity == self._room.local_participant.identity:
            await self._restore_local_participant(second_participant_identity)
            return

        # Handle remote participants
        await self._restore_remote_participant(participant_identity)

    async def _restore_local_participant(
        self, second_participant_identity: str
    ) -> None:
        """
        Restores the local participant (agent) and connects with second participant.
        """
        logger.info("Processing local participant (agent) restore")

        second_participant = self._room.remote_participants.get(
            second_participant_identity
        )
        if not second_participant:
            logger.error(
                f"Failed to find second participant {second_participant_identity}"
            )
            raise ValueError(
                f"Second participant {second_participant_identity} not found in room"
            )

        try:
            await self._restore_audio_connections(
                self._room.local_participant,
                second_participant
            )
        except Exception as e:
            logger.error(f"Connection failed with second participant: {str(e)}")
            raise

        logger.info("=== Completed local participant restore ===")

    async def _restore_remote_participant(self, participant_identity: str) -> None:
        """Restores a remote participant from hold state."""
        participant = self._room.remote_participants.get(participant_identity)
        if not participant:
            logger.error("Participant lookup failed")
            raise ValueError(f"Participant {participant_identity} not found in room")

        held_states = self._held_participants.get(participant_identity)
        if not held_states:
            logger.info(f"No hold state found for {participant_identity} - skipping")
            return

        await self._restore_participant_tracks(participant, held_states)
        await self.subscribe_participant_to_agent(participant_identity)

        del self._held_participants[participant_identity]
        logger.info(f"=== Completed restore process for {participant_identity} ===")

    async def _restore_audio_connections(
        self,
        source_participant: rtc.Participant,
        target_participant: rtc.Participant
    ) -> None:
        """Restores audio connections between two participants."""
        # Unmute source participant's tracks
        for pub in source_participant.track_publications.values():
            if pub.kind == rtc.TrackKind.KIND_AUDIO:
                await self._lk_api.room.mute_published_track(
                    MuteRoomTrackRequest(
                        room=self._room.name,
                        identity=source_participant.identity,
                        track_sid=pub.sid,
                        muted=False
                    )
                )
                logger.info(f"✓ Unmuted source track {pub.sid}")

        # Enable target participant's audio
        for pub in target_participant.track_publications.values():
            if pub.kind == rtc.TrackKind.KIND_AUDIO:
                pub.set_subscribed(True)
                await self._lk_api.room.mute_published_track(
                    MuteRoomTrackRequest(
                        room=self._room.name,
                        identity=target_participant.identity,
                        track_sid=pub.sid,
                        muted=False
                    )
                )
                logger.info("✓ Successfully enabled target audio")
