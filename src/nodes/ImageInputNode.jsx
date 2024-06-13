import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Handle, Position } from 'reactflow';

function ImageInputNode({ data }) {
  const [imageName, setImageName] = useState(null);

  const onImageChange = useCallback(
    (event) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        data.onImageUpload(file);
        setImageName(file.name);
      }
    },
    [data],
  );

  return (
    <div
      style={{
        background: ' linear-gradient(to right, #4eab56, #206d39)',
        borderRadius: '20px',
      }}
      className="flex justify-center items-center text-center w-56 h-56  p-8 l shadow-md border border-1 border-[#FFF]"
    >
      <div className="text-2xl  text-white ">
        <label className="block text-center mb-2">
          <span className=" cursor-pointer">Upload Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="hidden"
          />
        </label>

        {imageName && (
          <div className="text-center mt-4">
            <p className="text-lg font-medium">{imageName}</p>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}

ImageInputNode.propTypes = {
  data: PropTypes.shape({
    onImageUpload: PropTypes.func.isRequired,
  }).isRequired,
};

export default ImageInputNode;
