import React from 'react';

function Footer({ image }) {
  return (
    <div className=" ">
      <h2 className="text-center text-purple-900 text-2xl font-semibold mb-[10px] bg-gradient-to-br from-blue-100 to-purple-300 py-[10px]">
        Connect the Nodes to Get your Results
      </h2>
      {image && (
        <div className="">
          <img
            src={image}
            alt="Detected"
            width={400}
            className="h-[600px] border-4 border-green-700 m-auto mb-[20px]"
          />
        </div>
      )}
    </div>
  );
}

export default Footer;
