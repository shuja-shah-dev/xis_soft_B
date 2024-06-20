import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Handle, Position } from 'reactflow';

function WebcamInputNode({ data }) {
  const videoRef = useRef(null);

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
        console.error('Error accessing webcam:', error);
      }
    };

    initializeWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [data]);

  return (
    <div className="  p-6 rounded-3xl border border-1 border-[#FFF]"   style={{
      background: 'linear-gradient(180deg, #4CCAFF 0%, #2E7999 100%)',
    }}>
      <h3 className="mb-2 text-black text-2xl font-semibold text-center">
        Webcam
      </h3>
      <div style={{width: '220px'}}>
        <video ref={videoRef} autoPlay playsInline />
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

WebcamInputNode.propTypes = {
  data: PropTypes.shape({
    onVideoUpload: PropTypes.func.isRequired,
  }).isRequired,
};

export default WebcamInputNode;
