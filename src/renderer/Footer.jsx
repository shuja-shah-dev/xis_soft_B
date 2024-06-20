import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

function Footer({ image, frames }) {
  const canvasRef = useRef(null);
  const lastFrameIndexRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Exit early if canvas is not yet available

    const ctx = canvas.getContext('2d');
    if (!ctx) return; // Exit if getContext returns null (should not happen normally)

    let animationFrameId;

    const drawFrame = () => {
      if (frames.length > lastFrameIndexRef.current) {
        const frameData = frames[lastFrameIndexRef.current];
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
  }, [frames]);

  return (
    <div className="pb-[40px]" style={{ fontFamily: 'Gilroy' }}>
      <div
        className="border-dashed border border-[#876EE6] w-[80%] m-auto rounded-3xl"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(2.7px)',
        }}
      >
        <h2 className="text-center text-white text-[32px] font-semibold my-[20px]">
          Connect the Nodes to Get your Results
        </h2>
        <Link
          className="mb-10 text-white text-xl ml-[40px] top-8 absolute"
          to="/"
        >
          BACK
        </Link>
        {image && (
          <div className="">
            <img
              src={image}
              alt="Detected"
              width={400}
              className="h-[600px] m-auto my-[30px]"
            />
          </div>
        )}

        {frames.length > 0 && (
          <div className="">
            <canvas
              ref={canvasRef}
              className="m-auto my-[30px] w-[40%] h-[400px]"
            />
          </div>
        )}
      </div>
    </div>
  );
}

Footer.propTypes = {
  frames: PropTypes.arrayOf(PropTypes.string).isRequired, // Assuming frames is an array of base64 strings
};

export default Footer;
