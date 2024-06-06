import PropTypes from 'prop-types';

import { Handle, Position } from 'reactflow';

function ModelProvider({ data: { name } }) {
  return (
    <div>
      <div className="flex justify-center items-center text-center text-center rounded-md w-52 h-52 bg-gradient-to-br from-blue-200 to-purple-400 p-6 border border-purple-500">
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
    image: PropTypes.instanceOf(File),
  }).isRequired,
  id: PropTypes.string.isRequired,
};

export default ModelProvider;
