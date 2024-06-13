import PropTypes from 'prop-types';
import { Handle, Position } from 'reactflow';

function OrientationNode() {
  return (
    <div>
      <div
        style={{
          background: 'linear-gradient(135deg, #F5B03A 6.16%, #D65B27 93.1%)',
          borderRadius: '20px',
        }}
        className=" flex justify-center items-center text-center  w-52 h-40 p-6 border border-1 border-[#FFF]"
      >
        <h3 className="text-2xl font-semibold ">Orientation Correction</h3>
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
