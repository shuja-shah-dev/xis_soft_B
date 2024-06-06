
import PropTypes from 'prop-types';
import { Handle, Position } from 'reactflow';

function Switcher() {
  return (
    <div className="flex justify-center items-center text-center bg-gradient-to-br from-blue-100 to-purple-300 text-center p-4  text-black text-2xl font-semibold rounded-3xl w-52 h-52">
      <p className=" text-purple-800">Switcher</p>
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
