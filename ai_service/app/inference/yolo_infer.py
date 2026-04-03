from ultralytics import YOLO
import torch
from app.inference.detections import Detection
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))


class YoloInferencer:
    def __init__(self, model_path: str, device: str = "cuda"):
        if device == "cuda" and not torch.cuda.is_available():
            device = "cpu"

        self.device = device
        self.model = YOLO(model_path)
        self.model.to(self.device)

    def infer(self, frame):
        results = self.model(frame, verbose=False)
        return self._extract_detections(results)

    def _extract_detections(self, results):
        detections = []

        r = results[0]
        if r.boxes is None:
            return detections

        for box in r.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            x1, y1, x2, y2 = map(int, box.xyxy[0])

            detections.append(
                Detection(
                    class_id=cls_id,
                    class_name=self.model.names[cls_id],
                    confidence=conf,
                    x1=x1,
                    y1=y1,
                    x2=x2,
                    y2=y2,
                )
            )

        return detections
