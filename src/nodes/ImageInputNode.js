import { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";

const ImageInputNode = ({ data }) => {
  const [image, setImage] = useState(null);

  const onImageChange = useCallback(
    (event) => {
      if (event.target.files && event.target.files[0]) {
        const file = event.target.files[0];
        data.onImageUpload(file);
        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    },
    [data]
  );

  return (
    <div className="w-[300px] bg-gradient-to-br from-blue-100 to-purple-200 p-8 rounded-3xl shadow-md">
      <label className="block text-center mb-2">
        <span className=" bg-gradient-to-br from-blue-400 to-purple-300 hover:from-blue-500 hover:to-purple-400 text-white font-bold py-2 px-4 rounded cursor-pointer">
          Upload Image
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={onImageChange}
          className="hidden "
        />
      </label>

      {image && (
        <img
          src={image}
          alt="uploaded"
          style={{
            width: "250px",
            display: "block",
            margin: "0 auto",
            borderRadius: "4px",
            height: "250px",

          }}
          className="mt-6"
        />
      )}
      <Handle type="source" position={Position.Right} />
    </div>
  );
};

ImageInputNode.propTypes = {
  data: PropTypes.shape({
    onImageUpload: PropTypes.func.isRequired,
  }).isRequired,
};

export default ImageInputNode;
