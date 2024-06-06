import { useRef, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";

const WebcamInputNode = ({ data }) => {
  const videoRef = useRef(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    let stream;

    const initializeWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          data.onVideoUpload(stream);
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    if (showVideo) {
      initializeWebcam();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [data, showVideo]);

  const handleStartClick = () => {
    setShowVideo(true);
  };

  const handleVideoClick = () => {
    setShowVideo((prevShowVideo) => !prevShowVideo);
  };

  return (
    <div className="w-[400px] bg-gradient-to-br from-blue-100 to-purple-200 p-6 rounded-3xl">
      <h3 className="mb-2 text-black text-2xl font-semibold text-center">
        Webcam
      </h3>
      <div className="flex justify-center" onClick={handleStartClick}>
        <button className=" bg-gradient-to-br from-blue-400 to-purple-300 text-white font-bold py-2 px-4 rounded mb-2">
          Start
        </button>
      </div>

      {showVideo && (
        <div onClick={handleVideoClick}>
          <video ref={videoRef} autoPlay playsInline />
        </div>
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

WebcamInputNode.propTypes = {
  data: PropTypes.shape({
    onVideoUpload: PropTypes.func.isRequired,
  }).isRequired,
};

export default WebcamInputNode;
