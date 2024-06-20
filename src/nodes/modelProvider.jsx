import PropTypes from 'prop-types';

import { Handle, Position } from 'reactflow';

function ModelProvider({ data: { name } }) {
  return (
    <div>
      <div
        style={{
          background: 'linear-gradient(180deg, #876EE6 0%, #4B3D80 100%)',
          borderRadius: '20px',
        }}
        className="flex justify-center items-center text-center border border-1 border-[#FFF] w-52 h-52  p-6 "
      >
        <h3 className="text-white text-2xl  ">{name}</h3>
      </div>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

ModelProvider.propTypes = {
  data: PropTypes.shape({
    name: PropTypes.string.isRequired,
    image: PropTypes.oneOfType([
      PropTypes.instanceOf(File), // Accepts a File object
      PropTypes.string,
    ]),
  }).isRequired,
};

export default ModelProvider;
