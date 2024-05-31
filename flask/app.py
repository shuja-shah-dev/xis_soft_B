import base64
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
from io import BytesIO
from ultralytics import YOLO

app = Flask(__name__)
CORS(app, origins=['*'])

model = YOLO('./model.pt')
model2 = YOLO('./yolov8n.pt')

@app.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    try:
        image_file = request.files['image']
        image = Image.open(image_file)
        image_array = np.array(image)

        results = model(image_array, conf=0.9)
        output = results[0].plot()

        _, buffer = cv2.imencode('.jpg', output)
        detected_image_base64 = base64.b64encode(buffer).decode('utf-8')

        return jsonify({"detectedImage": detected_image_base64})
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
