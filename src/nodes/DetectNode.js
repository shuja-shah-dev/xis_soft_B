import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";

const DetectNode = () => {
  return (
    <div>
      <h3 className="bg-gradient-to-br from-blue-100 to-purple-200 p-6 text-black text-2xl font-semibold rounded-md">
        Detect
      </h3>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

DetectNode.propTypes = {
  data: PropTypes.shape({
    image: PropTypes.instanceOf(File),
    onDetection: PropTypes.func.isRequired,
  }).isRequired,
};

export default DetectNode;
