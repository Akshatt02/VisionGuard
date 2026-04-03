import cv2
import time


class VideoStream:
    def __init__(self, source=0, width=640, height=480):
        self.cap = cv2.VideoCapture(source)

        if not self.cap.isOpened():
            raise RuntimeError("Could not open video source")

        # Set resolution (important for performance)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

        self.prev_time = time.time()

    def read(self):
        ret, frame = self.cap.read()
        if not ret:
            return None, 0.0

        # FPS calculation
        current_time = time.time()
        fps = 1 / (current_time - self.prev_time)
        self.prev_time = current_time

        return frame, fps

    def release(self):
        self.cap.release()
        cv2.destroyAllWindows()
