import base64
import json
from pipecat.serializers.base_serializer import FrameSerializer
from pipecat.frames.frames import AudioRawFrame, Frame

class RawFrameSerializer(FrameSerializer):
    def __init__(self, stream_id: str):
        self._stream_id = stream_id

    def serialize(self, frame: Frame) -> str | bytes | None:
        if not isinstance(frame, AudioRawFrame):
            return None

        payload = base64.b64encode(frame.audio).decode("utf-8")
        return json.dumps({
            "event": "media",
            "streamId": self._stream_id,
            "media": {
                "payload": payload
            }
        })

    """ Ensure audio has highest quality, i.e edit sample rate etc.. """
    def deserialize(self, data: str | bytes) -> Frame | None:
        message = json.loads(data)
        if message["event"] != "media":
            return None

        payload = base64.b64decode(message["media"]["payload"])
        return AudioRawFrame(audio=payload, num_channels=1, sample_rate=16000)