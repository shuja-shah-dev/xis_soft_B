import io
import os
from tkinter import Image
import cv2
import numpy as np
import tempfile
from ultralytics import YOLO
from argparse import Namespace
from torch_inference import infer
from PIL import Image
from typing import List
from keras.models import load_model
from scipy.ndimage import rotate
import matplotlib.pyplot as plt

# import ssl

# # Disable SSL certificate verification (not recommended for production)
# ssl._create_default_https_context = ssl._create_unverified_context
import os
os.environ['REQUESTS_CA_BUNDLE'] = 'D:\\work\\gitRepos\\nodeElectron\\xis_soft_B\\flask\\cacert.pem'



def classifier(image):
    model = YOLO('bag_classifier.pt')

    results = model(image, conf=0.85)
    results[0].show()

    values=results[0].boxes.cls[0].item()

    print(values)

    for result in results:
        boxes = result.boxes
        xywh = boxes.xywh[0]
        x_center, y_center, width, height = xywh[0], xywh[1], xywh[2], xywh[3]

        print("x_center:", x_center)
        print("y_center:", y_center)
        print("width:", width)
        print("height:", height)
        x1, y1, x2, y2 = int(x_center - width / 2), int(y_center - height / 2), int(x_center + width / 2), int(y_center + height / 2)

        cropped_region = image[y1:y2, x1:x2]
        cv2.imwrite("OUTPUT.png", cropped_region)

    return cropped_region, values

def rotation(image):

    model = load_model('orientation_model.h5')

    #image_path = '/content/rotated_192.jpg'
    #image = cv2.imread(image_path)
    image=cv2.resize(image, (420,420))
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    if image is None:
        print("Error: Unable to load the image.")
    else:
        print("Image loaded successfully.")

    rotated_img = image[np.newaxis, :, :, :]
    rotated_img = rotated_img.astype('float32')

    output = model.predict(rotated_img)
    predicted_angle = np.argmax(output)
    print('Predicted angle: ', predicted_angle)

    image_path = rotate(image, 360 - predicted_angle)

    return image_path



def anomalib_inference(input_img, values):

    if values == 1:
        print("front")
        model_path = "bag_front_anomalib.pt"


        image_array = np.frombuffer(input_img, np.uint8)
        image_path = os.path.join(tempfile.gettempdir(), "temp_image.jpg")

        with open(image_path, "wb") as img_file:
            img_file.write(image_array)
        output="./"
        train_args = Namespace(
            weights=model_path,
            input=image_path,
            output=output,
            task="segmentation",
            visualization_mode="simple",
            device="auto",
            log_level="INFO",
        )
        inference_results = infer(train_args)
        #print(inference_results)
        image = Image.fromarray(inference_results)

        image_buffer = io.BytesIO()
        image.save(image_buffer, format="PNG")
        image_buffer.seek(0)


    else:
        print("back")
        model_path = "bag_back_anomalib.pt"

        with open(image_path, "rb") as img_file:
            image_bytes = img_file.read()

        image_array = np.frombuffer(image_bytes, np.uint8)
        image_path = os.path.join(tempfile.gettempdir(), "temp_image.jpg")

        with open(image_path, "wb") as img_file:
            img_file.write(image_bytes)
        output="./"
        train_args = Namespace(
            weights=model_path,
            input=image_path,
            output=output,
            task="segmentation",
            visualization_mode="simple",
            device="auto",
            log_level="INFO",
        )
        inference_results = infer(train_args)
        #print(inference_results)
        image = Image.fromarray(inference_results)

        image_buffer = io.BytesIO()
        image.save(image_buffer, format="PNG")
        image_buffer.seek(0)

print("Starting...")

image=cv2.imread("10.jpeg")
result, values=classifier(image)
result2=rotation(result)
result3=anomalib_inference(result2, values)
