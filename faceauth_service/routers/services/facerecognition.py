import random

async def verify_face(image):
    """
    Replace this with real deep learning model.
    """
    # TODO: Add:
    # - face detection
    # - face embedding
    # - liveness detection
    # - spoof check

    # Dummy prediction
    is_valid = random.choice([True, False])
    confidence = round(random.uniform(0.70, 0.99), 2)

    return is_valid, confidence
