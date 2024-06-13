/* eslint-disable react/button-has-type */
import React from 'react';
import PropTypes from 'prop-types';
import {
  BezierEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
} from 'reactflow';
import { X } from 'react-bootstrap-icons'; // Keep this import if you want to use the X icon from react-bootstrap-icons

function CustomEdge(props) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  } = props;

  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BezierEdge {...props} />
      <EdgeLabelRenderer>
        <button
          aria-label="Delete Edge"
          className="absolute text-red-500 transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ transform: `translate(${labelX}px, ${labelY}px)`, pointerEvents: 'all' }}
          onClick={() => {
            setEdges((prevEdges) => prevEdges.filter((edge) => edge.id !== id));
          }}
        >
          <X />
        </button>
      </EdgeLabelRenderer>
    </>
  );
}

CustomEdge.propTypes = {
  id: PropTypes.string.isRequired,
  sourceX: PropTypes.number.isRequired,
  sourceY: PropTypes.number.isRequired,
  targetX: PropTypes.number.isRequired,
  targetY: PropTypes.number.isRequired,
  sourcePosition: PropTypes.oneOf(['top', 'right', 'bottom', 'left']).isRequired,
  targetPosition: PropTypes.oneOf(['top', 'right', 'bottom', 'left']).isRequired,
};

export default CustomEdge;
