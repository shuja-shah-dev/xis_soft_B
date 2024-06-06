import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";

function OrientationNode() {
  return (
    <div>
    <div className=" flex justify-center items-center text-center rounded-md w-52 h-40 bg-gradient-to-br from-blue-200 to-purple-200 p-6">
      <h3 className=" text-purple-800 text-2xl font-semibold ">
        Orientation Correction
      </h3>

    </div>
     <Handle type="target" position={Position.Left} />
     <Handle type="source" position={Position.Right} />
     </div>
  );
}

OrientationNode.propTypes = {
  data: PropTypes.shape({
    image: PropTypes.string,
  }).isRequired,
};

export default OrientationNode;
