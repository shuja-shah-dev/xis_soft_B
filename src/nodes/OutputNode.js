import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";

const OutputNode = ({ data }) => {
  const canvasRef = useRef(null);
  const lastFrameIndexRef = useRef(0);

    const hasConnectionFromVideoInput = data.edges.some(
      (edge) => edge.source === "2" && edge.target === "3"
  );


  useEffect(() => {
    if (!hasConnectionFromVideoInput) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const drawFrame = () => {
      if (data.processedFrames.length > lastFrameIndexRef.current) {
        const frameData = data.processedFrames[lastFrameIndexRef.current];
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          lastFrameIndexRef.current++;
        };
        img.src = `data:image/jpeg;base64,${frameData}`;
      }
      animationFrameId = requestAnimationFrame(drawFrame);
    };

    drawFrame();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [data.processedFrames]);

  return (
    <div className="bg-gradient-to-br from-blue-100 to-purple-200 text-center p-4  text-black text-2xl font-semibold rounded-3xl">
      <p className="mb-2">Output</p>
      {data.detectedImage && (
        <img
          src={data.detectedImage}
          alt="Detected"
          width={300}
         className="h-[300px] mb-2"
        />
      )}
      {data.processedFrames && (
        <div className="">
          <canvas
            ref={canvasRef}
            style={{ maxWidth: "100%" }}
            height="300"
          ></canvas>
        </div>
      )}
      <Handle type="target" position={Position.Left} />
    </div>
  );
};

OutputNode.propTypes = {
  data: PropTypes.shape({
    processedFrames: PropTypes.arrayOf(PropTypes.string).isRequired,
    detectedImage: PropTypes.string,
    edges: PropTypes.array.isRequired,
  }).isRequired,
};

export default OutputNode;
