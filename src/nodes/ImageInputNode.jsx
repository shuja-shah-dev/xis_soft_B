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
    <div className="flex justify-center items-center text-center w-56 h-56 bg-gradient-to-br from-blue-100 to-purple-300 p-8 rounded-3xl shadow-md">
      <div className="">
        <label className="block text-center mb-2">
          <span className=" bg-gradient-to-br from-blue-400 text-base to-purple-300 hover:from-blue-500 hover:to-purple-400 text-white font-bold py-2 px-4 rounded cursor-pointer">
            Upload Image
          </span>
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
