from typing import List
from app.inference.detections import Detection


def helmet_violations(
    persons: List[Detection],
    helmets: List[Detection],
    head_ratio: float = 0.3,
):
    """
    Returns list of persons WITHOUT helmets.
    """

    violations = []

    for person in persons:
        px1, py1, px2, py2 = person.x1, person.y1, person.x2, person.y2
        p_width = px2 - px1
        p_height = py2 - py1

        # Head region = top 30% of person box
        head_y2 = py1 + int(p_height * head_ratio)

        has_helmet = False

        for helmet in helmets:
            hx1, hy1, hx2, hy2 = helmet.x1, helmet.y1, helmet.x2, helmet.y2

            # Check overlap with head region
            if (
                hx2 > px1
                and hx1 < px2
                and hy2 > py1
                and hy1 < head_y2
            ):
                has_helmet = True
                break

        if not has_helmet:
            violations.append(person)

    return violations
