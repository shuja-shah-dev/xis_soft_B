import PropTypes from 'prop-types';
import { Handle, Position } from 'reactflow';

function Switcher() {
  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #4CCAFF 0%, #2E7999 100%)',
      }}
      className="flex justify-center items-center text-center  text-center p-4 border border-1 border-[#FFF] text-black text-2xl font-semibold rounded-3xl w-52 h-52"
    >
      <p className="">Switcher</p>
      {/* {data.detectedImage && (
        <img
          src={data.detectedImage}
          alt="Detected"
          width={300}
         className="h-[300px] mb-2"
        />
      )} */}
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

Switcher.propTypes = {
  data: PropTypes.shape({
    detectedImage: PropTypes.string,
  }).isRequired,
};

export default Switcher;
