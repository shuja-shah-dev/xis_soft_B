import base64
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
from io import BytesIO
from ultralytics import YOLO
import os
import tempfile
from argparse import Namespace
from torch_inference import infer
from keras.models import load_model
from scipy.ndimage import rotate as scipy_rotate

app = Flask(__name__)
CORS(app, origins=['*'])



def rotation(image):
    model = load_model('orientation_model.h5')
    image = np.frombuffer(image, dtype=np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)

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

    rotated_image = scipy_rotate(image, 360 - predicted_angle, reshape=False)
    print("Image rotated.")

    pil_image = Image.fromarray(rotated_image.astype('uint8'))
    buffered = io.BytesIO()
    pil_image.save(buffered, format="JPEG")
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return img_str

def classifier(image):
    model = YOLO('bag_classifier.pt')

    results = model(image, conf=0.85)
    # results[0].show()
    output=results[0].plot()
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

    return output, values

def anomalib_inference(input_img, values, label):
    if label == "front" or label == "Front":
        print("front")
        model_path = "bag_front_anomalib.pt"

        image_array = np.frombuffer(input_img, np.uint8)
        image_path = os.path.join(tempfile.gettempdir(), "temp_image.jpg")

        with open(image_path, "wb") as img_file:
            img_file.write(image_array)

        output = "./"
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

    elif label == "back" or label == "Back":
        print("back")
        model_path = "bag_back_anomalib.pt"

        image_array = np.frombuffer(input_img, np.uint8)
        image_path = os.path.join(tempfile.gettempdir(), "temp_image.jpg")

        with open(image_path, "wb") as img_file:
            img_file.write(image_array)

        output = "./"
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


    image_array = np.array(inference_results, dtype=np.uint8)
    image = Image.fromarray(inference_results)
    image_buffer = io.BytesIO()
    image.save(image_buffer, format="PNG")
    image_buffer.seek(0)
    print(inference_results)
    image_base64 = base64.b64encode(image_buffer.getvalue()).decode('utf-8')

    return image_base64, inference_results

@app.route('/rotate', methods=['POST'])
def rotate():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    try:

        image_file = request.files['image']
        input_img = image_file.read()

        print(image_file)

        rotated_image  = rotation(input_img)


        return jsonify({'rotatedImage': rotated_image})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/detectAnomaly', methods=['POST'])
def detectAnomaly():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    try:

        image_file = request.files['image']
        print(image_file)
        input_img = image_file.read()
        values = int(request.form['values'])
        label = request.form.get('label')


        processed_image, results = anomalib_inference(input_img, values, label)


        return jsonify({'detectedImage': processed_image})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    try:
        image_file = request.files['image']
        print(image_file)
        image = cv2.imdecode(np.frombuffer(image_file.read(), np.uint8), cv2.IMREAD_COLOR)

        cropped_region, value = classifier(image)

        _, buffer = cv2.imencode('.jpg', cropped_region)
        detected_image_base64 = base64.b64encode(buffer).decode('utf-8')

        return jsonify({'value': value, 'detectedImage': detected_image_base64})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/detectVideo', methods=['POST'])
def detect_objects():
    if 'frame' not in request.files:
        return jsonify({"error": "No frame part in the request"}), 400

    try:
        frame_file = request.files['frame']
        frame_image = Image.open(frame_file.stream)
        frame_array = np.array(frame_image)

        results = model2(frame_array)
        output = results[0].plot()

        _, buffer = cv2.imencode('.jpg', output)
        processed_frame_base64 = base64.b64encode(buffer).decode('utf-8')

        return jsonify({"processed_frame": processed_frame_base64})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
