from typing import List
from app.inference.detections import Detection


def filter_person_detections(
    detections: List[Detection],
    min_confidence: float = 0.5,
):
    persons = []

    for det in detections:
        if det.class_name == "person" and det.confidence >= min_confidence:
            persons.append(det)

    return persons
