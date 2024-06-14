/* eslint-disable react/button-has-type */
import React from 'react';
import PropTypes from 'prop-types';
import { BezierEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';
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
    data,
  } = props;

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
          style={{
            transform: `translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          onClick={() => {
            if (data && data.handleRemoveEdge) {
              data.handleRemoveEdge(id, props.source, props.target);
            }
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
  sourcePosition: PropTypes.oneOf(['top', 'right', 'bottom', 'left'])
    .isRequired,
  targetPosition: PropTypes.oneOf(['top', 'right', 'bottom', 'left'])
    .isRequired,
  data: PropTypes.shape({
    handleRemoveEdge: PropTypes.func,
  }),
};

export default CustomEdge;
