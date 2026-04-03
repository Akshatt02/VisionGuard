from datetime import datetime
from typing import List
from app.inference.detections import Detection


class TemporalAnomalyEngine:
    def __init__(self, frames_required=3, cooldown_seconds=10):
        self.frames_required = frames_required
        self.cooldown_seconds = cooldown_seconds
        self.counter = 0
        self.active = False
        self.last_trigger_time = None

    def update(self, violation_present: bool):
        now = datetime.utcnow()

        if violation_present:
            self.counter += 1
        else:
            self.counter = 0

        if self.counter >= self.frames_required:
            if not self.active:
                if (
                    self.last_trigger_time is None
                    or (now - self.last_trigger_time).total_seconds()
                    > self.cooldown_seconds
                ):
                    self.active = True
                    self.last_trigger_time = now
                    return True

        self.active = False
        return False
